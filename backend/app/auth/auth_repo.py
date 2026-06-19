from sqlalchemy.orm import Session

from app.auth.models import RefreshToken


class AuthRepository:

    @staticmethod
    def get_refresh_token(db: Session, token: str):
        return db.query(RefreshToken).filter(RefreshToken.token == token).first()

    @staticmethod
    def create_refresh_token(
        db: Session,
        user_id: str,
        token: str,
        user_agent: str | None,
    ):
        record = RefreshToken(
            user_id=user_id,
            token=token,
            user_agent=user_agent,
            revoked=False,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def revoke_refresh_token(db: Session, token: str):
        record = AuthRepository.get_refresh_token(db, token)
        if record and not record.revoked:
            record.revoked = True
            db.commit()
            db.refresh(record)
        return record

    @staticmethod
    def revoke_all_user_tokens(db: Session, user_id: str):
        db.query(RefreshToken).filter(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked == False
        ).update({"revoked": True})
        db.commit()
