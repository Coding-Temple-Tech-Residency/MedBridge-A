from datetime import datetime
from pydantic import BaseModel


class ChatRequest(BaseModel):
    user_id: int
    document_id: int
    message: str


class ChatResponse(BaseModel):
    session_id: int
    message_id: int
    response: str
    created_at: datetime


class ChatHistoryResponse(BaseModel):
    role: str
    content: str
    created_at: datetime

class AskRequest(BaseModel):
    user_id: int
    document_id: int
    question: str


class AskResponse(BaseModel):
    document_id: int
    answer: str


# --- AI-208: summarization ---


class SummarizeRequest(BaseModel):
    document_id: int


class SummaryResponse(BaseModel):
    # The summary lives on the document row (documents.ai_summary) rather than
    # a separate ai_summaries table, so summary_id mirrors document_id. Kept in
    # the response for contract compatibility with criterion #47.
    summary_id: int
    document_id: int
    summary_text: str
