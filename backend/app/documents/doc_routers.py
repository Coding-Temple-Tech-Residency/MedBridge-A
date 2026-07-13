from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database import get_db

from app.pipelines.document_upload_pipeline import DocumentUploadPipeline
from app.documents.services.document_services import DocumentService

router = APIRouter(
    prefix="/api/v1//documents",
    tags=["Documents"]
)

# ---------------------------------------------------------
# POST /documents — Upload Document
# ---------------------------------------------------------
@router.post("/", summary="Upload a document")
async def upload_document(
    file: UploadFile | None = File(None),
    raw_text: str | None = Form(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    pipeline = DocumentUploadPipeline()

    file_bytes = await file.read() if file else None
    file_type = file.content_type if file else None

    doc = pipeline.run(
        db=db,
        user_id=user.id,
        file_bytes=file_bytes,
        file_type=file_type,
        raw_text=raw_text,
    )

    return {
        "id": doc.id,
        "file_name": doc.file_name,
        "file_type": doc.file_type,
        "upload_timestamp": doc.upload_timestamp.isoformat(),
        "storage_path": doc.storage_path,
    }


# ---------------------------------------------------------
# GET /documents — List Documents
# ---------------------------------------------------------
@router.get("/", summary="List documents")
def list_documents(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return DocumentService.list_user_documents(
        user_id=user.id,
        db=db,
    )


# ---------------------------------------------------------
# GET /documents/{id}/download — Signed URL
# ---------------------------------------------------------
@router.get("/{document_id}/download", summary="Download a document")
def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    url = DocumentService.get_download_url(
        document_id=document_id,
        user_id=user.id,
        db=db,
    )

    return {
        "document_id": document_id,
        "download_url": url,
        "expires_in": 3600,
    }
