from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app import models

from app.ai.tasks import trigger_summarize

from .schemas import DocumentUploadResponse
from .services import DocumentService

router = APIRouter(tags=["documents"])


@router.post(
    "/documents/upload",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: str | None = Form(default=None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # The route is JWT-protected (criterion #27), so current_user is the
    # authenticated identity and the only thing we ever store against.
    #
    # user_id is optional. The ticket's multipart contract specified it, but
    # the JWT already tells us who is uploading, so requiring the client to
    # send a value that must equal something we already know is redundant.
    # It stays accepted (and validated) so existing callers keep working, but
    # new ones can simply omit it.
    #
    # When it IS sent it is checked against — never substituted for —
    # current_user.id. Trusting a client-supplied user_id outright would let
    # one authenticated user upload documents under another user's account.
    if user_id is not None:
        try:
            submitted_user_id = int(user_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="user_id must be an integer.",
            )

        if submitted_user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="user_id does not match the authenticated user.",
            )

    content = await file.read()

    result = DocumentService.upload(
        db,
        file=file,
        content=content,
        user_id=current_user.id,
    )

    # Criterion #50 — auto-summarize in the background. The 201 goes out
    # immediately; the AI work happens after the response is sent. Failures
    # are logged inside the task and never affect this response (#51).
    background_tasks.add_task(trigger_summarize, result["document_id"])

    return result
