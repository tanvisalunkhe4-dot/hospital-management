from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import datetime
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os


# 1. Initialize the app ONLY ONCE
app = FastAPI(title="NexHealth Digital Spine") 

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "static")
PROFILE_PICS_DIR = os.path.join(STATIC_DIR, "profile_pics")

UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
MEDICAL_RECORDS_DIR = os.path.join(UPLOAD_DIR, "medical_records")

# 2. CREATE DIRECTORIES BEFORE MOUNTING
os.makedirs(PROFILE_PICS_DIR, exist_ok=True)
os.makedirs(MEDICAL_RECORDS_DIR, exist_ok=True)

# 🟢 Mount using the full absolute path we just found
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

load_dotenv()

# Database imports
from app.db import models
from app.db.session import engine

# Router imports (Merging both your and Tanvi's routers)
from app.router import receptionist as receptionist_router
from app.router import doctor as doctor_router
from app.router.auth import router as auth_router
from app.router.admin import router as admin_router
from app.router.superadmin import router as superadmin_router
from app.router.patient import patient_router
from app.router import security
from app.router import nurse
# Initialize Database tables
models.Base.metadata.create_all(bind=engine)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include All Route Modules ---

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(superadmin_router)

# Your Specialized Portals
app.include_router(receptionist_router.router)
app.include_router(doctor_router.router)
app.include_router(nurse.router)
# Patient Portal with specific prefix
app.include_router(
    patient_router, 
    prefix="/api/v1/patient", 
    tags=["Patient Portal"]
)


@app.get("/")
def health_check():
    return {
        "status": "NexHealth Node Online", 
        "version": "1.0.0",
        "timestamp": datetime.datetime.now().isoformat()
    }