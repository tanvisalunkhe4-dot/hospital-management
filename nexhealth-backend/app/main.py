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

# Create the tables in PostgreSQL
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="NexHealth Backend")

# Security Config
PWD_CONTEXT = CryptContext(schemes=["bcrypt"], deprecated="auto")
new_password = "admin1234"
hashed = PWD_CONTEXT.hash(new_password)

print(f"NEW HASH: {hashed}")
SECRET_KEY = "NEXHEALTH_INTERNAL_SECRET" 
ALGORITHM = "HS256"

# --- HELPERS ---
def get_password_hash(password: str):
    return PWD_CONTEXT.hash(password)

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
    """Fetch all registered hospitals for the SuperAdmin Dashboard"""
    hospitals = db.query(models.Hospital).all()
    return hospitals

@app.post("/api/v1/superadmin/hospitals/register") # Added /register
async def create_hospital(payload: schemas.HospitalCreate, db: Session = Depends(get_db)):
    # Check if hospital already exists
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
    """
    Decommissions a hospital node. 
    Note: This will also remove associated users if using CASCADE in models.
    """
    # 1. Find the hospital
    hospital = db.query(models.Hospital).filter(models.Hospital.id == hosp_id).first()
    
    if not hospital:
        raise HTTPException(
            status_code=404, 
            detail="Hospital node not found in registry"
        )

    try:
        # 2. Delete associated users first (to prevent Foreign Key errors)
        db.query(models.User).filter(models.User.hospital_id == hosp_id).delete()
        
        # 3. Delete the hospital
        db.delete(hospital)
        db.commit()
        
        return {
            "status": "success",
            "message": f"Facility {hospital.name} and all linked credentials decommissioned."
        }
    except Exception as e:
        db.rollback()
        print(f"DELETION ERROR: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Failed to decommission node due to active data dependencies."
        )
# --- SIGNUP LOGIC ---

@app.post("/api/v1/auth/signup")
async def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    linked_db_id = None
    
    # Only Admin/Staff need to be linked to a physical hospital via HFR ID
    if payload.role in ['Admin', 'Staff']:
        hosp = db.query(models.Hospital).filter(models.Hospital.hfr_id == payload.hospital_id).first()
        if not hosp:
            raise HTTPException(status_code=404, detail="Hospital ID not found in registry")
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
        print(f"DATABASE ERROR: {e}") 
        raise HTTPException(status_code=500, detail="Database integrity error. Check if user already exists.")

# --- LOGIN LOGIC ---

@app.post("/api/v1/auth/login", response_model=LoginResponse)
async def login(payload: LoginRequest, db: Session = Depends(get_db)):
    # 1. Normalize the identifier (lowercase email)
    search_identifier = payload.identifier.lower().strip()
    hosp_db_id = None
    
    # 2. Scope check: Resolve hospital_id from HFR_ID for Admin/Staff
    if payload.role in ['Admin', 'Staff']:
        if not payload.hospitalId:
            raise HTTPException(status_code=400, detail="Hospital ID is required for this role")
        
        hosp = db.query(models.Hospital).filter(models.Hospital.hfr_id == payload.hospitalId).first()
        if not hosp:
            raise HTTPException(status_code=404, detail="Invalid Hospital Facility ID")
        hosp_db_id = hosp.id

    # 3. Find User
    query = db.query(models.User).filter(
        or_(
            models.User.email == search_identifier,
            models.User.staff_id == search_identifier,
            models.User.phone == search_identifier
        )
    )
    
    # IMPORTANT: Only filter by hospital_id if the user is NOT a SuperAdmin
    if payload.role in ['Admin', 'Staff']:
        query = query.filter(models.User.hospital_id == hosp_db_id)
        
    user = query.first()

    # 4. Detailed Error Checking (Helps you debug "Invalid Credentials")
    if not user:
        # Debugging print for your terminal
        print(f"Login Failed: User {search_identifier} not found for role {payload.role}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not PWD_CONTEXT.verify(payload.password, user.hashed_password):
        print(f"Login Failed: Password mismatch for {search_identifier}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # 5. Strict Role Enforcement
    if user.role != payload.role:
        raise HTTPException(
            status_code=403, 
            detail=f"Access Denied: This account is a {user.role}, but you are trying to log in as {payload.role}"
        )

    # 6. Generate Token
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
            "sub_role": user.sub_role,
            "hospital_id": user.hospital_id
        }
    }