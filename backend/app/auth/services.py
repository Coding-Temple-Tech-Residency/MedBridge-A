from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.auth.users_repo import UserRepository
from app.auth.auth_repo import AuthRepository

# Optional: enable audit logging
# from app.audit.services import AuditService


class AuthService:

    # ==========================
    # REGISTER
    # ==========================
    @staticmethod
    def register(db: Session, email: str, password: str):
        existing = UserRepository.get_by_email(db, email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        hashed = hash_password(password)
        user = UserRepository.create(db, email, hashed)

        # Optional audit log
        # AuditService.log_event(db, "REGISTER_SUCCESS", user_id=str(user.id))

        return user

    # ==========================
    # LOGIN
    # ==========================
    @staticmethod
    def login(db: Session, email: str, password: str, user_agent: str | None):
        user = UserRepository.get_by_email(db, email)
        if not user or not verify_password(password, user.password):
            # Optional audit log
            # AuditService.log_event(db, "LOGIN_FAILED", metadata={"email": email})
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        access = create_access_token({"sub": str(user.id)})
        refresh = create_refresh_token({"sub": str(user.id)})

        AuthRepository.create_refresh_token(db, str(user.id), refresh, user_agent)

        # Optional audit log
        # AuditService.log_event(db, "LOGIN_SUCCESS", user_id=str(user.id))

        return access, refresh

    # ==========================
    # REFRESH (WITH ROTATION)
    # ==========================
    @staticmethod
    def refresh(db: Session, refresh_token: str, user_agent: str | None = None):
        # 1. Lookup token in DB
        record = AuthRepository.get_refresh_token(db, refresh_token)

        if not record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        # 2. If token already revoked → COMPROMISED SESSION
        if record.revoked:
            AuthRepository.revoke_all_user_tokens(db, record.user_id)

            # Optional audit log
            # AuditService.log_event(
            #     db,
            #     "REFRESH_REUSE_DETECTED",
            #     user_id=str(record.user_id),
            #     metadata={"token": refresh_token},
            # )

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token reuse detected. All sessions revoked.",
            )

        # 3. Decode token (checks expiration + signature)
        try:
            payload = decode_token(refresh_token)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(e),
            )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token payload",
            )

        # 4. ROTATE TOKEN — revoke old one
        AuthRepository.revoke_refresh_token(db, refresh_token)

        # 5. Create new refresh token
        new_refresh = create_refresh_token({"sub": user_id})
        AuthRepository.create_refresh_token(db, user_id, new_refresh, user_agent)

        # 6. Create new access token
        new_access = create_access_token({"sub": user_id})

        # Optional audit log
        # AuditService.log_event(
        #     db,
        #     "REFRESH_ROTATED",
        #     user_id=user_id,
        #     metadata={"old_token": refresh_token},
        # )

        return new_access, new_refresh

    # ==========================
    # LOGOUT (ONE SESSION)
    # ==========================
    @staticmethod
    def logout(db: Session, refresh_token: str):
        record = AuthRepository.revoke_refresh_token(db, refresh_token)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Refresh token not found",
            )

        # Optional audit log
        # AuditService.log_event(db, "LOGOUT", user_id=str(record.user_id))

        return {"message": "Logged out successfully"}

    # ==========================
    # LOGOUT ALL SESSIONS
    # ==========================
    @staticmethod
    def logout_all(db: Session, user_id: str):
        AuthRepository.revoke_all_user_tokens(db, user_id)

        # Optional audit log
        # AuditService.log_event(db, "LOGOUT_ALL_SESSIONS", user_id=user_id)

        return {"message": "All sessions have been logged out"}
