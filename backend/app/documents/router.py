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
    user_id: str = Form(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # The route is JWT-protected (criterion #27), so current_user is already
    # the authenticated identity. The form still accepts user_id per the
    # ticket's multipart contract, but it is checked against — never
    # substituted for — current_user.id. Trusting a client-supplied user_id
    # outright would let one authenticated user upload documents under
    # another user's account (the same IDOR shape AI-206 was written to
    # prevent on /patients).
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
