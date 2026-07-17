from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, Document, Conversation

from app.ai.schemas import (
    SummarizeRequest,
    SummaryResponse,
    AskRequest,
    AskResponse,
    ChatRequest,
    ChatResponse,
    ChatHistoryResponse,
)

from app.services.summarizer import summarize_document

from app.ai.services import (
    run_qa_engine_single,
    run_qa_engine,
)

from app.ai.repo import (
    get_document,
    save_summary,
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
        document_text=document.original_text,
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
