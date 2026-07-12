from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app import models
from app.patients.schemas import PatientsResponse, DashboardStats
from app.patients.services import PatientService

router = APIRouter(tags=["patients"])


@router.get("/patients", response_model=PatientsResponse)
def list_patients(
    search: str | None = Query(default=None, description="Filter by first/last name"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return PatientService.list_patients(
        db, search=search, page=page, page_size=page_size
    )


@router.get("/dashboard/stats", response_model=DashboardStats)
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return PatientService.get_stats(db)
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_admin
from app import models
from app.patients.schemas import PatientsResponse, DashboardStats
from app.patients.services import PatientService

router = APIRouter(tags=["patients"])


@router.get("/patients", response_model=PatientsResponse)
def list_patients(
    search: str | None = Query(default=None, description="Filter by first/last name"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin: models.User = Depends(require_admin),
):
    return PatientService.list_patients(
        db, search=search, page=page, page_size=page_size
    )


@router.get("/dashboard/stats", response_model=DashboardStats)
def dashboard_stats(
    db: Session = Depends(get_db),
    _admin: models.User = Depends(require_admin),
):
    return PatientService.get_stats(db)
