import uuid

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.audit.services import AuditService
from app.services.document_parser import UnsupportedFileTypeError, parse_document
from app.services.storage import StorageUploadError, upload_file

from .repo import DocumentRepository

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB, criterion #28
MIN_EXTRACTED_TEXT_LENGTH = 20  # criterion #32
STORAGE_BUCKET = "documents"


class DocumentService:

    @staticmethod
    def upload(
        db: Session,
        file: UploadFile,
        content: bytes,
        user_id: int,
    ) -> dict:
        # --- 413: size limit (criterion #28) ---
        if len(content) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File exceeds the 10 MB upload limit.",
            )

        # --- 415: unsupported type, parsing also gives us the text ---
        # Parsing runs before the storage upload on purpose: an unreadable
        # or unsupported file should never touch Supabase Storage, so
        # nothing orphaned is left behind in the bucket. (Ticket lists
        # storage upload at #28 and parsing at #29, but that's a checklist
        # order, not an execution order — validate first, store second.)
        try:
            text, file_type = parse_document(content, file.content_type, file.filename)
        except UnsupportedFileTypeError as exc:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=(
                    f"Unsupported file type: {exc.content_type or 'unknown'}. "
                    "Supported types are PDF, PNG, and TXT."
                ),
            )

        # --- 422: nothing usable extracted (criterion #32, exact message) ---
        if len(text) < MIN_EXTRACTED_TEXT_LENGTH:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    "Could not extract readable text from this document. "
                    "Please try a clearer image or a text-based PDF."
                ),
            )

        storage_path = f"{user_id}/{uuid.uuid4()}/{file.filename}"
        try:
            upload_file(
                STORAGE_BUCKET,
                storage_path,
                content,
                file.content_type or "application/octet-stream",
            )
        except StorageUploadError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to store the uploaded file. Please try again.",
            ) from exc

        document = DocumentRepository.create(
            db,
            user_id=user_id,
            filename=file.filename,
            file_type=file_type,
            storage_path=storage_path,
            original_text=text,
        )

        # Best-effort — matches the audit convention from AuthService.
        AuditService.log_event(
            db,
            "document.upload",
            user_id=user_id,
            detail={
                "document_id": document.id,
                "filename": file.filename,
                "file_type": file_type,
            },
        )

        return {
            "document_id": document.id,
            "filename": document.filename,
            "file_type": document.file_type,
            "storage_path": document.storage_path,
            "preview": text[:300],
        }
