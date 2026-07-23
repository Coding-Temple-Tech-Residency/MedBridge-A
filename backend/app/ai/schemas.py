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


# --- Health metrics (plan §6) ---


class ExtractMetricsRequest(BaseModel):
    document_id: int


class MetricReading(BaseModel):
    id: int
    metric_name: str
    metric_value: float
    unit: str | None = None
    reference_range: str | None = None
    test_date: str | None = None
    status: str

    class Config:
        from_attributes = True


class ExtractMetricsResponse(BaseModel):
    document_id: int
    metrics_extracted: int
    metrics: list[MetricReading]


class MetricSeries(BaseModel):
    # One metric tracked over time — e.g. every Hemoglobin reading, oldest
    # first. This is the shape a trend chart consumes directly: name + an
    # ordered list of points.
    metric_name: str
    unit: str | None = None
    latest_status: str
    readings: list[MetricReading]


class HealthMetricsResponse(BaseModel):
    user_id: int
    series: list[MetricSeries]
