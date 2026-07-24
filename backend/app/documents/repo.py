from sqlalchemy.orm import Session

from .. import models


class DocumentRepository:

    @staticmethod
    def create(
        db: Session,
        user_id: int,
        filename: str,
        file_type: str,
        storage_path: str,
        original_text: str,
    ) -> models.Document:
        document = models.Document(
            user_id=user_id,
            filename=filename,
            file_type=file_type,
            storage_path=storage_path,
            original_text=original_text,
            status="uploaded",
        )
        db.add(document)
        db.commit()
        db.refresh(document)
        return document
