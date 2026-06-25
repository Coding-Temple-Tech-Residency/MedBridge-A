from datetime import datetime, timedelta

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Date,
    Float,
    Text,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship

from .database import Base


# ---------------------------------------------------------------------------
# AUTH  (preserved exactly as the working version — do not change the columns
# the auth flow depends on; we only ADD created_at and role to User)
# ---------------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    # --- added for analytics + access control ---
    role = Column(String, nullable=False, default="patient")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # relationships
    refresh_tokens = relationship("RefreshToken", back_populates="user")
    documents = relationship("Document", back_populates="user")
    lab_results = relationship("LabResult", back_populates="user")
    conversations = relationship("Conversation", back_populates="user")
    audit_entries = relationship("AuditLog", back_populates="user")
    usage_events = relationship("UsageEvent", back_populates="user")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    revoked = Column(Boolean, default=False, nullable=False)
    user_agent = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)

    user = relationship("User", back_populates="refresh_tokens")

    @staticmethod
    def default_expiry(days: int = 30) -> datetime:
        return datetime.utcnow() + timedelta(days=days)


# ---------------------------------------------------------------------------
# DOCUMENTS  — uploaded / pasted medical documents and their AI summaries
# ---------------------------------------------------------------------------
class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # "lab_report", "visit_summary", "imaging", "other"
    document_type = Column(String, nullable=False, default="other")
    # "uploaded", "processing", "summarized", "failed"
    status = Column(String, nullable=False, default="uploaded")

    title = Column(String, nullable=True)
    original_text = Column(Text, nullable=True)   # the pasted / extracted text
    ai_summary = Column(Text, nullable=True)       # plain-language AI summary

    is_active = Column(Boolean, default=True, nullable=False)  # soft delete
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    user = relationship("User", back_populates="documents")
    lab_results = relationship("LabResult", back_populates="document")


# ---------------------------------------------------------------------------
# LAB RESULTS  — structured values extracted from a document
# ---------------------------------------------------------------------------
class LabResult(Base):
    __tablename__ = "lab_results"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    test_name = Column(String, nullable=False)     # e.g. "Hemoglobin A1c"
    value = Column(Float, nullable=True)
    unit = Column(String, nullable=True)           # e.g. "%", "mg/dL"
    reference_range = Column(String, nullable=True)  # e.g. "4.0-5.6"
    result_date = Column(Date, nullable=True)      # when the test was taken

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    document = relationship("Document", back_populates="lab_results")
    user = relationship("User", back_populates="lab_results")


# ---------------------------------------------------------------------------
# CONVERSATIONS  — "ask your records" chat threads
# ---------------------------------------------------------------------------
class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    title = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation")


# ---------------------------------------------------------------------------
# MESSAGES  — individual turns within a conversation
# ---------------------------------------------------------------------------
class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(
        Integer, ForeignKey("conversations.id"), nullable=False, index=True
    )

    # "user", "assistant", "system"
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    conversation = relationship("Conversation", back_populates="messages")


# ---------------------------------------------------------------------------
# AUDIT LOG  — HIPAA-style trail; flexible detail as JSON
# (Edward's auth success/failure-rate queries read from here)
# ---------------------------------------------------------------------------
class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)

    action = Column(String, nullable=False, index=True)  # e.g. "login.success"
    detail = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    user = relationship("User", back_populates="audit_entries")


# ---------------------------------------------------------------------------
# USAGE EVENTS  — in-house product analytics
# (Edward's DAU / WAU / retention queries read from here)
# ---------------------------------------------------------------------------
class UsageEvent(Base):
    __tablename__ = "usage_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)

    event_type = Column(String, nullable=False, index=True)  # e.g. "document.upload"
    event_metadata = Column("metadata", JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    user = relationship("User", back_populates="usage_events")
