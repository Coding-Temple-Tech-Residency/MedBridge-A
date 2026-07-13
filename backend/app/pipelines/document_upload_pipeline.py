# app/pipelines/document_upload_pipeline.py

from backend.app.documents.services.validators.file_validation import FileValidationService
from documents.services.text_conversion import TextConversionService
from app.documents.services.document_parser import parse_document
from app.documents.services.storage_service import StorageService
from app.documents.repository.document_repository import DocumentRepository


class DocumentUploadPipeline:
    """
    MedBridge Document Upload Pipeline
    ----------------------------------
    Orchestrates:
    - Validation
    - Text conversion (raw text → .txt)
    - Parsing (PDF, PNG/JPEG, TXT)
    - Storage upload
    - Metadata persistence
    """

    def __init__(self):
        self.validator = FileValidationService()
        self.text_converter = TextConversionService()
        self.storage = StorageService()
        self.repo = DocumentRepository()

    def run(
        self,
        db,
        user_id: int,
        file_bytes: bytes | None,
        file_type: str | None,
        raw_text: str | None,
    ):
        """
        Main pipeline entry point.

        Supports:
        - Multipart file upload
        - Raw text upload (converted to .txt)
        """

        # ---------------------------------------------------------
        # 1. Handle raw text uploads
        # ---------------------------------------------------------
        if raw_text is not None:
            file_bytes, file_name, mime = self.text_converter.convert(raw_text)

        else:
            # Must have file bytes
            if not file_bytes:
                raise ValueError("No file uploaded.")

            # Validate file + detect MIME
            mime = self.validator.validate(file_bytes, file_type)
            file_name = f"uploaded.{mime.split('/')[-1]}"

        # ---------------------------------------------------------
        # 2. Extract text (PDF, PNG/JPEG, TXT)
        # ---------------------------------------------------------
        extracted_text = parse_document(file_bytes, mime)

        # ---------------------------------------------------------
        # 3. Upload to Supabase Storage
        # ---------------------------------------------------------
        storage_path = self.storage.upload(
            user_id=user_id,
            file_name=file_name,
            file_bytes=file_bytes,
            mime=mime,
        )

        # ---------------------------------------------------------
        # 4. Persist metadata in PostgreSQL
        # ---------------------------------------------------------
        doc = self.repo.create(
            db=db,
            user_id=user_id,
            file_name=file_name,
            file_type=mime,
            storage_path=storage_path,
            file_size_bytes=len(file_bytes),
            extracted_text=extracted_text,
            extraction_warning=(len(extracted_text) == 0),
        )

        # ---------------------------------------------------------
        # 5. Return document record
        # ---------------------------------------------------------
        return doc
