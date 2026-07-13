# app/services/document_service.py

from fastapi import HTTPException
from app.documents.repository.document_repository import DocumentRepository
from app.documents.services.storage_service import StorageService

class DocumentService:

    @staticmethod
    def list_user_documents(user_id: int, db):
        repo = DocumentRepository()
        return repo.list_by_user(db, user_id)

    @staticmethod
    def get_download_url(document_id: int, user_id: int, db):
        repo = DocumentRepository()
        storage = StorageService()

        doc = repo.get_by_id(db, document_id)

        if not doc or doc.deleted:
            raise HTTPException(404, "Document not found.")

        if doc.user_id != user_id:
            raise HTTPException(403, "Not authorized.")

        return storage.signed_url(doc.storage_path)

    @staticmethod
    def soft_delete(document_id: int, user_id: int, db):
        repo = DocumentRepository()
        doc = repo.get_by_id(db, document_id)

        if not doc or doc.deleted:
            raise HTTPException(404, "Document not found.")

        if doc.user_id != user_id:
            raise HTTPException(403, "Not authorized.")

        repo.soft_delete(db, document_id)
        return {"detail": "Document deleted."}
