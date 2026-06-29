from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.security import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.auth.users_repo import UsersRepository
from app.auth.auth_repo import AuthRepository
from app.auth.schemas import UserCreate

# Optional: enable audit logging
# from app.audit.services import AuditService


class AuthService:

    # ==========================
    # REGISTER
    # ==========================
    @staticmethod
    def register(db: Session, user_in: UserCreate):
        existing = UsersRepository.get_by_email(db, user_in.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",

           )
        user = UsersRepository.create(db, user_in)


        # AuditService.log_event(db, "REGISTER_SUCCESS", user_id=str(user.id))

        return user

    # ==========================
    # LOGIN
    # ==========================
    @staticmethod
    def login(db: Session, login_in, user_agent: str | None = None):
        user = UsersRepository.get_by_email(db, login_in.email)
        # NOTE: model field is `hashed_password`, not `password`
        if not user or not verify_password(login_in.password, user.hashed_password):
        # AuditService.log_event(db, "LOGIN_FAILED", metadata={"email": email})
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        access = create_access_token({"sub": str(user.id)})

        # Repo generates + stores the opaque refresh token and returns the row.
        refresh_record = AuthRepository.create_refresh_token(db, user.id, user_agent)
        refresh = refresh_record.token

        # AuditService.log_event(db, "LOGIN_SUCCESS", user_id=str(user.id))

        return access, refresh

    # ==========================
    # REFRESH (WITH ROTATION)
    # ==========================
    @staticmethod
    def refresh(db: Session, refresh_token: str, user_agent: str | None = None):
        # 1. Look the opaque token up in the DB (this IS the validation)
        record = AuthRepository.get_refresh_token(db, refresh_token)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        # 2. Reuse of a revoked token => compromised session, revoke everything
        if record.revoked:
            AuthRepository.revoke_all_for_user(db, record.user_id)
            # AuditService.log_event(db, "REFRESH_REUSE_DETECTED", user_id=str(record.user_id))
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token reuse detected. All sessions revoked.",
            )

        # 3. Optional: reject expired tokens
        # from datetime import datetime
        # if record.expires_at and record.expires_at < datetime.utcnow():
        #     raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Refresh token expired")

        # 4. Rotate: revoke the old row, issue a fresh opaque token (repo does both)
        new_record = AuthRepository.rotate_refresh_token(db, record, user_agent)
        new_refresh = new_record.token

        # 5. New access token (user identity comes from the DB row, not a decode)
        new_access = create_access_token({"sub": str(record.user_id)})

        # AuditService.log_event(db, "REFRESH_ROTATED", user_id=str(record.user_id))

        return new_access, new_refresh

    # ==========================
    # LOGOUT (ONE SESSION)
    # ==========================
    @staticmethod
    def logout(db: Session, current_user, refresh_token: str):
        record = AuthRepository.get_refresh_token(db, refresh_token)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Refresh token not found",
            )

        AuthRepository.revoke_token(db, record)

        # AuditService.log_event(db, "LOGOUT", user_id=str(record.user_id))

        return {"message": "Logged out successfully"}

    # ==========================
    # LOGOUT ALL SESSIONS
    # ==========================
    @staticmethod
    def logout_all(db: Session, user_id: str):
        AuthRepository.revoke_all_for_user(db, user_id)

        # AuditService.log_event(db, "LOGOUT_ALL_SESSIONS", user_id=user_id)

        return {"message": "All sessions have been logged out"}
