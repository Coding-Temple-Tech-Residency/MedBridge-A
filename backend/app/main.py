# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.auth.router import router as auth_router
from app.database import engine, Base


# Load environment variables
load_dotenv()

# Create tables (only for local dev; disable in production)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MedBridge Backend",
    version="1.0.0",
    description="Authentication + Document AI backend for MedBridge"
)

# CORS — FE on Vercel, BE on Render
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)