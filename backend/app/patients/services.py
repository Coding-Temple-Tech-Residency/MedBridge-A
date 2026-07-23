from sqlalchemy.orm import Session

from .repo import PatientRepository


class PatientService:

    @staticmethod
    def list_patients(
        db: Session,
        search: str | None = None,
        page: int = 1,
        page_size: int = 25,
    ):
        rows, total = PatientRepository.list(
            db, search=search, page=page, page_size=page_size
        )
        return {
            "patients": rows,
            "total": total,
            "page": page,
            "page_size": page_size,
        }

    @staticmethod
    def get_stats(db: Session):
        return PatientRepository.stats(db)
