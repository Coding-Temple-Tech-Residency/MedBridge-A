
from sqlalchemy.orm import Session

from .. import models
from .schemas import UserCreate
from ..security import hash_password


class UsersRepository:

    @staticmethod
    def get_by_email(db: Session, email: str) -> models.User | None:
        return db.query(models.User).filter(models.User.email == email).first()

    @staticmethod
    def create(db: Session, user_in: UserCreate) -> models.User:
        user = models.User(
            email=user_in.email,
            hashed_password=hash_password(user_in.password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
