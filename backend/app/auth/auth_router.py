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
)
from .services import AuthService


router = APIRouter(prefix="/auth", tags=["auth"])

COOKIE_NAME = "refresh_token"
COOKIE_MAX_AGE = 60 * 60 * 24 * 30  # 30 days
COOKIE_SECURE = False  # local dev; set True in production
COOKIE_HTTPONLY = True
COOKIE_SAMESITE = "lax"  # use "none" in production with HTTPS


def set_refresh_cookie(response: Response, token: str):
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=COOKIE_HTTPONLY,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=COOKIE_MAX_AGE,
        path="/auth",
    )


def clear_refresh_cookie(response: Response):
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/auth",
    )


@router.post("/register", response_model=UserRead)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user = AuthService.register(db, user_in)
    return user


@router.post("/login", response_model=Token)
def login(
    login_in: LoginRequest,response: Response,
    db: Session = Depends(get_db),
    user_agent: str | None = Header(default=None, alias="User-Agent"),
    ):
    access, refresh = AuthService.login(db, login_in, user_agent)
    set_refresh_cookie(response, refresh)
    return {"access_token": access, "token_type": "bearer"}


@router.post("/refresh", response_model=Token)
def refresh(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    user_agent: str | None = Header(default=None, alias="User-Agent"),
    body: RefreshRequest | None = None,
):
    cookie_token = request.cookies.get(COOKIE_NAME)
    body_token = body.refresh_token if body else None

    refresh_token = body_token or cookie_token
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")

    access, new_refresh = AuthService.refresh(db, refresh_token, user_agent)
    set_refresh_cookie(response, new_refresh)
    return {"access_token": access, "token_type": "bearer"}


@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    body: LogoutRequest | None = None,
):
    cookie_token = request.cookies.get(COOKIE_NAME)
    body_token = body.refresh_token if body else None
    refresh_token = body_token or cookie_token

    AuthService.logout(db, current_user, refresh_token)
    clear_refresh_cookie(response)
    return {"detail": "Logged out"}


@router.get("/me", response_model=UserRead)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user
