# app/repositories/document_repository.py

from sqlalchemy.orm import Session
from datetime import datetime
from app.core.models import Document   # updated model name

class DocumentRepository:
    """
    MedBridge Document Repository
    ------------------------------
    Responsibilities:
    - Database access for user documents
    - No business logic
    - No storage logic
    - No validation logic
    """

    # ---------------------------------------------------------
    # CREATE
    # ---------------------------------------------------------
    def create(
        self,
        db: Session,
        user_id: int,
        file_name: str,
        file_type: str,
        storage_path: str,
        file_size_bytes: int,
        extracted_text: str,
        extraction_warning: bool,
    ) -> Document:
        """
        Insert a new document record into PostgreSQL.
        """

        doc = Document(
            user_id=user_id,
            file_name=file_name,
            file_type=file_type,
            storage_path=storage_path,
            file_size_bytes=file_size_bytes,
            extracted_text=extracted_text,
            extraction_warning=extraction_warning,
            upload_timestamp=datetime.utcnow(),
            deleted=False,
        )

        db.add(doc)
        db.commit()
        db.refresh(doc)
        return doc

    # ---------------------------------------------------------
    # READ
    # ---------------------------------------------------------
    def get_by_id(self, db: Session, document_id: int) -> Document | None:
        """
        Fetch a single document by ID.
        """
        return (
            db.query(Document)
            .filter(Document.id == document_id)
            .first()
        )

    def list_by_user(self, db: Session, user_id: int) -> list[Document]:
        """
        Return all non-deleted documents for a user.
        """
        return (
            db.query(Document)
            .filter(Document.user_id == user_id)
            .filter(Document.deleted == False)
            .order_by(Document.upload_timestamp.desc())
            .all()
        )

    # ---------------------------------------------------------
    # UPDATE (Soft Delete)
    # ---------------------------------------------------------
    def soft_delete(self, db: Session, document_id: int):
        """
        Mark a document as deleted=true.
        """
        doc = self.get_by_id(db, document_id)
        if not doc:
            return

        doc.deleted = True
        db.commit()

    # ---------------------------------------------------------
    # HARD DELETE (Optional)
    # ---------------------------------------------------------
    def hard_delete(self, db: Session, document_id: int):
        """
        Permanently remove a document record.
        Used only if storage deletion is confirmed.
        """
        doc = self.get_by_id(db, document_id)
        if not doc:
            return

        db.delete(doc)
        db.commit()
