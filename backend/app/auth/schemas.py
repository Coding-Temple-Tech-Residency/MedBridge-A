# backend/app/auth/schemas.py
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int
    email : str
    is_active: bool
    role : str| None = None

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead

class RefreshRequest(BaseModel):
    refresh_token: str | None = None  # optional if using cookie only


class LogoutRequest(BaseModel):
    refresh_token: str | None = None  # optional; cookie is primary
