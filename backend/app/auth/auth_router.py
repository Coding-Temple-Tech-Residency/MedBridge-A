from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.schemas import RegisterRequest, LoginRequest, TokenResponse, RefreshRequest, RegisterResponse
from app.auth.services import AuthService
from app.auth.security import create_access_token, jwt, SECRET_KEY, ALGORITHM
from app.auth.models import User

router = APIRouter(prefix="/auth", tags=["Auth"])






@router.post("/register", response_model=RegisterResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = AuthService.register(db, payload.email, payload.password)

    return RegisterResponse(
        message="User registered successfully",
        email=user.email,
        id=str(user.id)
    )




@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    access, refresh = AuthService.login(
        db,
        payload.email,
        payload.password,
        request.headers.get("user-agent")
    )

    return TokenResponse(
        access_token=access,
        refresh_token=refresh,
        token_type="bearer"
    )


@router.post("/refresh")
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    access = AuthService.refresh(db, payload.refresh_token)
    return {"access_token": access, "token_type": "bearer"}


@router.post("/logout")
def logout(payload: RefreshRequest, db: Session = Depends(get_db)):
    AuthService.logout(db, payload.refresh_token)
    return {"message": "Logged out"}


@router.get("/me")
def me(token: str, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": str(user.id), "email": user.email}
