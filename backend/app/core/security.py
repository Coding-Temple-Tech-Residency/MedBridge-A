
from datetime import datetime, timedelta, timezone
from jose import jwt
import uuid

from app.core.config import settings

def _create_token(subject: str, token_type: str, expires_delta: timedelta) -> str:
    jti = str(uuid.uuid4())
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode = {
        "sub": subject,
        "type": token_type,
        "jti": jti,
        "exp": expire,
    }
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    return encoded_jwt, jti

def create_access_token(user_id: str) -> tuple[str, str]:
    return _create_token(
        subject=user_id,
        token_type="access",
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

def create_refresh_token(user_id: str) -> tuple[str, str]:
    return _create_token(
        subject=user_id,
        token_type="refresh",
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
