
from datetime import datetime, timedelta
from uuid import uuid4
from sqlalchemy.orm import Session
from .. import models




class AuthRepository:

    @staticmethod
    def create_refresh_token(
        db: Session,
        user_id: int,
        user_agent: str | None = None,
        days_valid: int = 30,
    ) -> models.RefreshToken:
        token_str = str(uuid4())
        refresh = models.RefreshToken(
            user_id=user_id,
            token=token_str,
            user_agent=user_agent,
            revoked=False,
            expires_at=datetime.utcnow() + timedelta(days=days_valid),
        )
        db.add(refresh)
        db.commit()
        db.refresh(refresh)
        return refresh

    @staticmethod
    def get_refresh_token(db: Session, token: str) -> models.RefreshToken | None:
        return (
            db.query(models.RefreshToken)
            .filter(models.RefreshToken.token == token)
            .first()
        )

    @staticmethod
    def rotate_refresh_token(
        db: Session,
        old_token: models.RefreshToken,
        user_agent: str | None = None,
        days_valid: int = 30,
    ) -> models.RefreshToken:
        old_token.revoked = True
        db.add(old_token)

        new_token = models.RefreshToken(
            user_id=old_token.user_id,
            token=str(uuid4()),
            user_agent=user_agent,
            revoked=False,
            expires_at=datetime.utcnow() + timedelta(days=days_valid),
        )
        db.add(new_token)
        db.commit()
        db.refresh(new_token)
        return new_token

    @staticmethod
    def revoke_token(db: Session, token: models.RefreshToken) -> None:
        token.revoked = True
        db.add(token)
        db.commit()

    @staticmethod
    def revoke_all_for_user(db: Session, user_id: int) -> None:
        db.query(models.RefreshToken).filter(
            models.RefreshToken.user_id == user_id,
            models.RefreshToken.revoked == False,  # noqa: E712
        ).update({"revoked": True})
        db.commit()
