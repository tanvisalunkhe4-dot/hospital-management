from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_
from passlib.context import CryptContext
from sqlalchemy import delete
from jose import jwt
import datetime
from typing import List

from .db import models
from .db.session import engine, get_db
from .schemas import auth_schema as schemas 
from .schemas.auth_schema import SignupRequest, LoginRequest, LoginResponse, HospitalCreate

# --- FIX: Import from the NEW folder ---
# If your folder is named 'router', use this:
from app.router import receptionist as receptionist_router

# --- SECURITY CONFIG ---
PWD_CONTEXT = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "NEXHEALTH_INTERNAL_SECRET" 
ALGORITHM = "HS256"

def get_password_hash(password: str):
    return PWD_CONTEXT.hash(password)

# Create the tables in PostgreSQL
models.Base.metadata.create_all(bind=engine)
app = FastAPI(title="NexHealth Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_credentials=True,
    allow_headers=["*"],
)

# --- SUPERADMIN: HOSPITAL MANAGEMENT ---

@app.get("/api/v1/superadmin/hospitals")
async def get_all_hospitals(db: Session = Depends(get_db)):
    hospitals = db.query(models.Hospital).all()
    return hospitals

@app.post("/api/v1/superadmin/hospitals/register")
async def create_hospital(payload: schemas.HospitalCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Hospital).filter(models.Hospital.hfr_id == payload.hfrId).first()
    if existing:
        raise HTTPException(status_code=400, detail="Hospital already registered")

    new_hosp = models.Hospital(
        name=payload.name,
        hfr_id=payload.hfrId,
        admin_email=payload.email,
        phone=payload.phone,
        category=payload.category,
        facility_type=payload.type,  
        address=payload.address,
        city=payload.city,
        state=payload.state,
        bed_capacity=payload.bedCapacity
    )
    db.add(new_hosp)
    db.commit()
    db.refresh(new_hosp)
    return {"message": "Hospital created successfully", "id": new_hosp.id}

@app.delete("/api/v1/superadmin/hospitals/{hosp_id}")
async def decommission_hospital(hosp_id: int, db: Session = Depends(get_db)):
    hospital = db.query(models.Hospital).filter(models.Hospital.id == hosp_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    try:
        db.query(models.User).filter(models.User.hospital_id == hosp_id).delete()
        db.delete(hospital)
        db.commit()
        return {"status": "success", "message": f"Facility {hospital.name} decommissioned."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to decommission node.")

# --- SIGNUP LOGIC ---

@app.post("/api/v1/auth/signup")
async def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    linked_db_id = None
    if payload.role in ['Admin', 'Staff']:
        hosp = db.query(models.Hospital).filter(models.Hospital.hfr_id == payload.hospital_id).first()
        if not hosp:
            raise HTTPException(status_code=404, detail="Hospital ID not found")
        linked_db_id = hosp.id 

    try:
        new_user = models.User(
            email=payload.identifier,
            role=payload.role,
            hashed_password=get_password_hash(payload.password),
            hospital_id=linked_db_id 
        )
        db.add(new_user)
        db.commit()
        return {"message": f"{payload.role} registered successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="User already exists.")

# --- LOGIN LOGIC ---

@app.post("/api/v1/auth/login", response_model=LoginResponse)
async def login(payload: LoginRequest, db: Session = Depends(get_db)):
    search_identifier = payload.identifier.lower().strip()
    user = db.query(models.User).filter(models.User.email == search_identifier).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid Email")
    if not PWD_CONTEXT.verify(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid Password")
    if user.role != payload.role:
        raise HTTPException(status_code=403, detail=f"Role mismatch: {user.role}")

    token_data = {
        "sub": str(user.id), 
        "role": user.role, 
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=10)
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "role": user.role,
            "hospital_id": user.hospital_id
        }
    }

# --- RECEPTIONIST ROUTER (Fixes 404) ---
# We include it here. Since receptionist.py already has prefix="/api/v1/receptionist",
# we just include the router object.
app.include_router(receptionist_router.router)