from pydantic import BaseModel


class DocumentUploadResponse(BaseModel):
    document_id: int
    filename: str
    file_type: str
    storage_path: str
    preview: str
