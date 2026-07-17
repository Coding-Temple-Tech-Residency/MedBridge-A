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
        .order_by(Message.created_at.asc())
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
