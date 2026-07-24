from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, Document, Conversation

from app.ai.schemas import (
    SummarizeRequest,
    SummaryResponse,
    ExtractMetricsRequest,
    ExtractMetricsResponse,
    MetricReading,
    MetricSeries,
    HealthMetricsResponse,
    AskRequest,
    AskResponse,
    ChatRequest,
    ChatResponse,
    ChatHistoryResponse,
)

from app.services.summarizer import summarize_document
from app.services.metrics_extractor import extract_health_metrics

from app.ai.services import (
    run_qa_engine_single,
    run_qa_engine,
)

from app.ai.repo import (
    get_document,
    save_summary,
    save_lab_results,
    get_user_lab_results,
    get_or_create_conversation,
    get_conversation_history,
    insert_user_message,
    insert_assistant_message,
)


router = APIRouter(tags=["ai"])


# ---------------------------------------------------------------------------
# AI‑208 — Single‑Turn Q&A
# ---------------------------------------------------------------------------
@router.post("/ai/ask", response_model=AskResponse)
def ask_question(
    payload: AskRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Ensure user is authorized
    if current_user.id != payload.user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # 2. Verify document exists and belongs to user
    document = db.query(Document).filter(Document.id == payload.document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if document.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: not your document")

    # 3. Run AI engine (single-turn)
    answer = run_qa_engine_single(
        document_text=document.original_text,
        question=payload.question,
    )

    # 4. Return answer
    return AskResponse(
        document_id=document.id,
        answer=answer,
    )


# ---------------------------------------------------------------------------
# AI‑210 — Multi‑Turn Chat (Session + History)
# ---------------------------------------------------------------------------
@router.post("/ai/chat", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Ensure user is authorized
    if current_user.id != payload.user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # 2. Verify document exists and belongs to user
    document = db.query(Document).filter(Document.id == payload.document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if document.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: not your document")

    # 3. Get or create conversation (session)
    conversation = get_or_create_conversation(
        db=db,
        user_id=current_user.id,
        document_id=payload.document_id,
    )

    # 4. Fetch conversation history
    history = get_conversation_history(db=db, conversation_id=conversation.id)

    # 5. Insert user message BEFORE calling AI
    insert_user_message(
        db=db,
        conversation_id=conversation.id,
        content=payload.message,
    )

    # 6. Run AI engine (multi-turn)
    ai_response = run_qa_engine(
        document_text=document.original_text or "",
        question=payload.message,
        history=[
            {"role": m.role, "content": m.content}
            for m in history
        ],
    )

    # 7. Insert assistant message AFTER AI responds
    assistant_msg = insert_assistant_message(
        db=db,
        conversation_id=conversation.id,
        content=ai_response,
    )

    # 8. Return response
    return ChatResponse(
        session_id=conversation.id,
        message_id=assistant_msg.id,
        response=assistant_msg.content,
        created_at=assistant_msg.created_at,
    )


# ---------------------------------------------------------------------------
# AI‑210 — Chat History
# ---------------------------------------------------------------------------
@router.get("/ai/chat/history/{session_id}", response_model=list[ChatHistoryResponse])
def chat_history(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify conversation exists
    conversation = db.query(Conversation).filter(Conversation.id == session_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Session not found")

    # Verify user owns the conversation
    if conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Fetch messages
    messages = get_conversation_history(db=db, conversation_id=session_id)

    return [
        ChatHistoryResponse(
            role=m.role,
            content=m.content,
            created_at=m.created_at,
        )
        for m in messages
    ]


# ---------------------------------------------------------------------------
# AI-208 — Summarization routes
# ---------------------------------------------------------------------------
@router.post("/ai/summarize", response_model=SummaryResponse)
def summarize(
    payload: SummarizeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate and store a plain-language summary for a document."""
    document = get_document(db, payload.document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if document.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: not your document")

    if not document.original_text:
        raise HTTPException(
            status_code=422,
            detail="This document has no extracted text to summarize.",
        )

    summary_text = summarize_document(document.original_text)
    save_summary(db, document, summary_text)

    return SummaryResponse(
        summary_id=document.id,
        document_id=document.id,
        summary_text=summary_text,
    )


@router.get("/ai/summary/{document_id}", response_model=SummaryResponse)
def get_summary(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Read back a stored summary. No AI call — this reads from the database."""
    document = get_document(db, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if document.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: not your document")

    if not document.ai_summary:
        raise HTTPException(
            status_code=404,
            detail="Summary not yet generated. Please try again in a moment.",
        )

    return SummaryResponse(
        summary_id=document.id,
        document_id=document.id,
        summary_text=document.ai_summary,
    )


# ---------------------------------------------------------------------------
# Health metrics (plan §6)
# ---------------------------------------------------------------------------
@router.post("/ai/extract-metrics", response_model=ExtractMetricsResponse)
def extract_metrics(
    payload: ExtractMetricsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Extract structured lab values from a document and store them."""
    document = get_document(db, payload.document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    if document.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: not your document")

    metrics = extract_health_metrics(document.original_text or "")
    rows = save_lab_results(db, document, metrics)

    return ExtractMetricsResponse(
        document_id=document.id,
        metrics_extracted=len(rows),
        metrics=[_reading_from_row(r) for r in rows],
    )


@router.get("/health/metrics/{user_id}", response_model=HealthMetricsResponse)
def health_metrics(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return a user's metrics grouped by name, each series ordered by date.

    Grouped this way so the frontend can draw one trend line per metric without
    reshaping the data.
    """
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    rows = get_user_lab_results(db, user_id)

    # group into series by metric name, preserving the oldest-first order
    series_map: dict[str, list] = {}
    for r in rows:
        series_map.setdefault(r.test_name, []).append(r)

    series = []
    for name, readings in series_map.items():
        series.append(
            MetricSeries(
                metric_name=name,
                unit=readings[-1].unit,
                latest_status=readings[-1].status,
                readings=[_reading_from_row(r) for r in readings],
            )
        )

    return HealthMetricsResponse(user_id=user_id, series=series)


def _reading_from_row(r) -> MetricReading:
    return MetricReading(
        id=r.id,
        metric_name=r.test_name,
        metric_value=r.value,
        unit=r.unit,
        reference_range=r.reference_range,
        test_date=r.result_date.isoformat() if r.result_date else None,
        status=r.status,
    )
