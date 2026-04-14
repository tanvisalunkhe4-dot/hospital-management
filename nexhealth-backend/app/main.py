from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import datetime

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

# Initialize Database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="NexHealth Digital Spine")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include All Route Modules ---

# Tanvi's Modular Routers (These now contain Auth, Admin, and SuperAdmin)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(superadmin_router)

# Your Specialized Portals
app.include_router(receptionist_router.router)
app.include_router(doctor_router.router)

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