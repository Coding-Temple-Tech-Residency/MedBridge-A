import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.auth.auth_router import router as auth_router
from app.patients.router import router as patients_router
from app.documents.router import router as documents_router
from app.ai.ai_router import router as ai_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MedBridge Auth")

# Allowed browser origins for CORS.
#
# Defaults cover local development (Vite serves the frontend on 5173; 3000 is
# kept for anyone running a CRA-style dev server). Deployed environments set
# CORS_ORIGINS to a comma-separated list instead, so the Azure URL doesn't have
# to be hardcoded here.
_default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

_env_origins = os.environ.get("CORS_ORIGINS", "").strip()
origins = (
    [o.strip() for o in _env_origins.split(",") if o.strip()]
    if _env_origins
    else _default_origins
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1/auth")
app.include_router(patients_router, prefix="/api/v1")
app.include_router(documents_router, prefix="/api/v1")
app.include_router(ai_router, prefix="/api/v1")
@app.get("/")
def root():
    return {"message": "OK"}
