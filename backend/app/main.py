from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.auth.auth_router import router as auth_router
from app.patients.router import router as patients_router
from app.documents.router import router as documents_router
from app.ai.ai_router import router as ai_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MedBridge Auth")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

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

@app.get("/")
def root():
    return {"message": "OK"}
