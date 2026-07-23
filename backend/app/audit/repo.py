from sqlalchemy.orm import Session

from .. import models


class AuditRepository:
    """Data-access layer for the audit_log table."""

    @staticmethod
    def create(
        db: Session,
        action: str,
        user_id: int | None = None,
        detail: dict | None = None,
    ) -> models.AuditLog:
        entry = models.AuditLog(
            action=action,
            user_id=user_id,
            detail=detail,
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry
