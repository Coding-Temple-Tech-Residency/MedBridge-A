from pydantic import BaseModel, Field
from typing import Optional, List


class DocumentUploadRequest(BaseModel):
    user_id: int = Field(..., description="User the document belongs to")
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    file_name: str = Field(..., description="Original filename")
    file_type: str = Field(
        ...,
        pattern="^(application/pdf|image/png|text/plain)$",
        description="Allowed MIME types: PDF, PNG, TXT"
    )


class DocumentResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    file_name: str
    file_type: str
    storage_url: str
    created_at: str
    updated_at: str



class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int