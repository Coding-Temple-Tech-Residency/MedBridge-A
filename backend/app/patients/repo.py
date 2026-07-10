from datetime import date

from sqlalchemy import or_
from sqlalchemy.orm import Session

from .. import models


class PatientRepository:

    @staticmethod
    def list(
        db: Session,
        search: str | None = None,
        page: int = 1,
        page_size: int = 25,
    ) -> tuple[list[models.Patient], int]:
        query = db.query(models.Patient)

        if search:
            term = f"%{search}%"
            query = query.filter(
                or_(
                    models.Patient.first_name.ilike(term),
                    models.Patient.last_name.ilike(term),
                )
            )

        total = query.count()
        offset = (page - 1) * page_size
        rows = (
            query.order_by(models.Patient.last_name, models.Patient.first_name)
            .offset(offset)
            .limit(page_size)
            .all()
        )
        return rows, total

    @staticmethod
    def stats(db: Session) -> dict:
        total = db.query(models.Patient).count()
        insured = db.query(models.Patient).filter(
            models.Patient.insured.is_(True)
        ).count()
        uninsured = total - insured

        avg_age = 0.0
        if total > 0:
            today = date.today()
            dobs = db.query(models.Patient.date_of_birth).all()
            ages = [
                (today.year - d[0].year)
                - ((today.month, today.day) < (d[0].month, d[0].day))
                for d in dobs
            ]
            avg_age = round(sum(ages) / len(ages), 1)

        return {
            "total_patients": total,
            "insured_count": insured,
            "uninsured_count": uninsured,
            "average_age": avg_age,
        }
