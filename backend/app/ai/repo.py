from datetime import datetime
from sqlalchemy.orm import Session

from app.models import Conversation, Message


# ---------------------------------------------------------------------------
# Conversation helpers
# ---------------------------------------------------------------------------
def get_or_create_conversation(db: Session, user_id: int, document_id: int):
    convo = (
        db.query(Conversation)
        .filter(
            Conversation.user_id == user_id,
            Conversation.document_id == document_id,
        )
        .first()
    )

    if convo:
        return convo

    convo = Conversation(
        user_id=user_id,
        document_id=document_id,
        created_at=datetime.utcnow(),
    )
    db.add(convo)
    db.commit()
    db.refresh(convo)
    return convo


# ---------------------------------------------------------------------------
# Message helpers
# ---------------------------------------------------------------------------
def get_conversation_history(db: Session, conversation_id: int):
    return (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc(), Message.id.asc())
        .all()
    )


def insert_user_message(db: Session, conversation_id: int, content: str):
    msg = Message(
        conversation_id=conversation_id,
        role="user",
        content=content,
        created_at=datetime.utcnow(),
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def insert_assistant_message(db: Session, conversation_id: int, content: str):
    msg = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=content,
        created_at=datetime.utcnow(),
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


# ---------------------------------------------------------------------------
# Document / summary helpers (AI-208)
# ---------------------------------------------------------------------------
def get_document(db: Session, document_id: int):
    from app.models import Document

    return db.query(Document).filter(Document.id == document_id).first()


def save_summary(db: Session, document, summary_text: str):
    document.ai_summary = summary_text
    document.status = "summarized"
    db.commit()
    db.refresh(document)
    return document


# ---------------------------------------------------------------------------
# Health metrics (plan §6)
# ---------------------------------------------------------------------------
def save_lab_results(db: Session, document, metrics: list[dict]):
    """Persist extracted metrics as LabResult rows. Returns the created rows."""
    from app.models import LabResult

    rows = []
    for m in metrics:
        row = LabResult(
            document_id=document.id,
            user_id=document.user_id,
            test_name=m["metric_name"],
            value=m["metric_value"],
            unit=m.get("unit"),
            reference_range=m.get("reference_range"),
            result_date=m.get("test_date"),
            status=m.get("status", "unknown"),
        )
        db.add(row)
        rows.append(row)

    db.commit()
    for row in rows:
        db.refresh(row)
    return rows


def get_user_lab_results(db: Session, user_id: int):
    """All of a user's lab results, oldest first (by test date, then insert)."""
    from app.models import LabResult

    return (
        db.query(LabResult)
        .filter(LabResult.user_id == user_id)
        .order_by(LabResult.result_date.asc().nullslast(), LabResult.id.asc())
        .all()
    )
