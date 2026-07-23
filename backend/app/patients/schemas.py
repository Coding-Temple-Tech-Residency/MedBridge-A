from datetime import date

from pydantic import BaseModel


class PatientRead(BaseModel):
    id: int
    first_name: str
    last_name: str
    weight: float
    date_of_birth: date
    insured: bool

    class Config:
        from_attributes = True


class PatientsResponse(BaseModel):
    patients: list[PatientRead]
    total: int
    page: int
    page_size: int


class DashboardStats(BaseModel):
    total_patients: int
    insured_count: int
    uninsured_count: int
    average_age: float
