"""Background tasks for the AI layer (AI-208).

These run after the HTTP response has already been sent, so they must never
raise into the request and must open their own database session — the
request's session is closed by the time they execute.
"""

import logging

from app.database import SessionLocal
from app.models import Document
from app.services.summarizer import summarize_document

logger = logging.getLogger(__name__)


def trigger_summarize(document_id: int) -> None:
    """Summarize a document in the background (criteria #50, #51).

    Failures are logged and swallowed: the upload has already returned 201 and
    must not be affected by anything that happens here.
    """
    db = SessionLocal()
    document = None
    try:
        document = db.query(Document).filter(Document.id == document_id).first()
        if document is None:
            logger.warning("Background summarize: document %s not found", document_id)
            return
        if not document.original_text:
            logger.warning("Background summarize: document %s has no text", document_id)
            return

        document.status = "processing"
        db.commit()

        summary = summarize_document(document.original_text)

        document.ai_summary = summary
        document.status = "summarized"
        db.commit()
        logger.info("Background summarize: document %s summarized", document_id)

    except Exception:
        logger.exception("Background summarize failed for document %s", document_id)
        try:
            if document is not None:
                document.status = "failed"
                db.commit()
        except Exception:
            logger.exception("Could not mark document %s as failed", document_id)
    finally:
        db.close()
