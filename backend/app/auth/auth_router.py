from fastapi import APIRouter, Depends, Header, Request, Response, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from .. import models
from .schemas import (
    UserCreate,
    UserRead,
    LoginRequest,
    Token,
    RefreshRequest,
    LogoutRequest,
    LoginResponse,
)
from .services import AuthService


router = APIRouter(tags=["auth"])

COOKIE_NAME = "refresh_token"
COOKIE_MAX_AGE = 60 * 60 * 24 * 30  # 30 days
COOKIE_SECURE = False  # local dev; set True in production
COOKIE_HTTPONLY = True
COOKIE_SAMESITE ="lax" #"strict"  # use "none" in production with HTTPS


def set_refresh_cookie(response: Response, token: str):
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=COOKIE_HTTPONLY,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=COOKIE_MAX_AGE,
        path="/api/v1/auth",
    )


def clear_refresh_cookie(response: Response):
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/api/v1/auth",
    )


@router.post("/register", response_model=UserRead)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    return AuthService.register(db, user_in)
    


@router.post("/login", response_model=LoginResponse)
def login(
    login_in: LoginRequest,response: Response,
    db: Session = Depends(get_db),
    user_agent: str | None = Header(default=None, alias="User-Agent"),
    ):
    access, refresh, user = AuthService.login(db, login_in, user_agent)
    set_refresh_cookie(response, refresh)
    return {"access_token": access, "token_type": "bearer", "user": user}


@router.post("/refresh")
def refresh(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    user_agent: str | None = Header(default=None, alias="User-Agent"),
    
):
    refresh_token = request.cookies.get(COOKIE_NAME)
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")

    access, new_refresh = AuthService.refresh(db, refresh_token, user_agent)
    set_refresh_cookie(response, new_refresh)
    return {"access_token": access}


@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    
):
    refresh_token = request.cookies.get(COOKIE_NAME)
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")
    AuthService.logout(db,refresh_token)
    clear_refresh_cookie(response)
    return {"detail": "Logged out"}


@router.get("/me", response_model=UserRead)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user
