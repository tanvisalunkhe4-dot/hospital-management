from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from sqlalchemy import or_
import datetime
import random
import string
from sqlalchemy import func  # Add this line
from ..db.session import get_db
from ..db import models
from ..schemas.auth_schema import SignupRequest, LoginRequest, LoginResponse

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])

PWD_CONTEXT = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "NEXHEALTH_INTERNAL_SECRET"
ALGORITHM = "HS256"


def get_password_hash(password: str):
    return PWD_CONTEXT.hash(password)


def generate_staff_id(role: str):
    prefix = "ADM" if role == 'Admin' else "STF"
    return f"NX-{prefix}-{''.join(random.choices(string.digits, k=4))}"


@router.post("/signup")
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    # 1. Duplicate check
    existing_user = db.query(models.User).filter(
        func.lower(models.User.email) == payload.identifier.lower()
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=400, 
            detail=f"User with identifier {payload.identifier} already exists."
        )

    linked_db_id = None
    new_staff_id = None  # Initialize as None for Patients

    # 2. Role-Specific Logic (Admin/Staff only)
    if payload.role in ['Admin', 'Staff']:
        # Lookup Hospital
        hosp = db.query(models.Hospital).filter(models.Hospital.hfr_id == payload.hospital_id).first()
        if not hosp:
            raise HTTPException(status_code=404, detail="Hospital Registration ID not found")
        linked_db_id = hosp.id

        # Generate Unique Staff ID
        while True:
            candidate_id = generate_staff_id(payload.role)
            id_exists = db.query(models.User).filter(models.User.staff_id == candidate_id).first()
            if not id_exists:
                new_staff_id = candidate_id
                break

    # 3. Create the User (staff_id will be null for Patients)
    new_user = models.User(
        email=payload.identifier.lower(),
        role=payload.role,
        staff_id=new_staff_id, 
        hashed_password=get_password_hash(payload.password),
        hospital_id=linked_db_id,
        is_active=True 
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except Exception as e:
        db.rollback()
        print(f"Error: {e}") # Log the actual error for debugging
        raise HTTPException(status_code=500, detail="Database error during registration")

    return {
        "message": "User created successfully",
        "staff_id": new_user.staff_id  # This will be null in the JSON response for patients
    }

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    search_identifier = payload.identifier.strip()
    hosp_db_id = None

    # --- 1. HOSPITAL VALIDATION ---
    # Triggered for Admin, Staff, and Receptionist roles
    if payload.role in ['Admin', 'Staff', 'Receptionist']:
        if not payload.hospital_id:
            raise HTTPException(status_code=400, detail="Hospital ID required")

        print(f"DEBUG: Attempting login for {search_identifier}")
        print(f"DEBUG: Hospital ID string entered: {payload.hospital_id}")
        
        # Resolve the string HFR-ID (like HFR-0908) to the database primary key (ID 3)
        hosp = db.query(models.Hospital).filter(
            or_(
                models.Hospital.hfr_id == payload.hospital_id.upper().strip(),
                models.Hospital.id.cast(models.String) == payload.hospital_id.strip()
            )
        ).first()

        if not hosp:
            print("DEBUG: Hospital lookup failed")
            raise HTTPException(status_code=404, detail="Invalid Hospital ID")

        hosp_db_id = hosp.id
        print(f"DEBUG: Found Hospital Database ID: {hosp_db_id}")

    # --- 2. FLEXIBLE USER LOOKUP ---
    # Search by email, phone, or the specific Staff ID
    query = db.query(models.User).filter(
        or_(
            models.User.email == search_identifier.lower(),
            models.User.phone == search_identifier,
            models.User.staff_id == search_identifier.upper()
        )
    )

    # Apply the hospital filter if the user is a staff member/admin
    if hosp_db_id:
        query = query.filter(models.User.hospital_id == hosp_db_id)
    
    user = query.first()

    
    # --- 3. SECURITY & VERIFICATION ---
    if not user:
        print(f"DEBUG: User query returned None for {search_identifier}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Define your universal demo password
    DEFAULT_DEMO_PASSWORD = "admin123" 

    # We use .strip() on the payload password to ignore accidental spaces
    entered_password = payload.password.strip()
    db_password = user.hashed_password.strip() if user.hashed_password else ""

    # Logic: Check if they used the universal password OR their specific DB password
    is_master_password = (entered_password == DEFAULT_DEMO_PASSWORD)
    is_db_password = (entered_password == db_password)

    if not (is_master_password or is_db_password):
        print(f"DEBUG: Password verification failed for {search_identifier}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # --- 4. ROLE PERMISSIONS GUARD ---
    # Unified check for Staff-level roles
    if payload.role in ["Staff", "Receptionist"]:
        if user.role not in ["Staff", "Receptionist"]:
            raise HTTPException(status_code=403, detail="Access denied: Invalid staff role")
    
    # Strict matching for Patients, Admins, and SuperAdmins
    elif user.role != payload.role:
        print(f"DEBUG: Role mismatch. Sent: {payload.role}, DB: {user.role}")
        raise HTTPException(status_code=403, detail="Role mismatch")

    # --- 5. TOKEN GENERATION ---
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
            "id": user.id,
            "role": user.role,
            "hospital_id": user.hospital_id,
            "email": user.email
        }
    }