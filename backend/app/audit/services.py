import logging

from sqlalchemy.orm import Session

from .repo import AuditRepository

logger = logging.getLogger("medbridge.audit")


class AuditService:
    """Writes security-relevant events to the audit_log table.

    Convention: lowercase, dot-separated, noun.verb (e.g. "login.success").
    Best-effort: a failed audit write must never break the calling auth flow.
    """

    @staticmethod
    def log_event(
        db: Session,
        action: str,
        user_id: int | None = None,
        detail: dict | None = None,
    ) -> None:
        try:
            AuditRepository.create(
                db,
                action=action,
                user_id=user_id,
                detail=detail,
            )
        except Exception:  # noqa: BLE001 - audit must never break the caller
            try:
                db.rollback()
            except Exception:  # noqa: BLE001
                pass
            logger.exception("Failed to write audit_log event: %s", action)
