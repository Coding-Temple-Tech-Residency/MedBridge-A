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
