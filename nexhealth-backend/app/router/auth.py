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

    # 1. Validate hospital for staff/admin
    if payload.role in ['Admin', 'Staff']:
        if not payload.hospital_id:
            raise HTTPException(status_code=400, detail="Hospital ID required")

        print(f"DEBUG: Attempting login for {search_identifier}")
        print(f"DEBUG: Hospital ID string entered: {payload.hospital_id}")
        #this is used to find hospital
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

    # 2. Flexible user lookup
    #this is used to find user
    query = db.query(models.User).filter(
        or_(
            models.User.email == search_identifier.lower(),
            models.User.phone == search_identifier,
            models.User.staff_id == search_identifier.upper()
        )
    )

    # Apply hospital filter for Admin/Staff
    if payload.role in ['Admin', 'Staff']:
        query = query.filter(models.User.hospital_id == hosp_db_id)

    user = query.first()

    # 3. Secure Verification
    if not user:
        print("DEBUG: User query returned None")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    try:
        is_password_correct = PWD_CONTEXT.verify(payload.password, user.hashed_password)
    except ValueError as e:
        print(f"CRITICAL ERROR: Corrupted hash in DB for user {user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Server error: User security record is corrupted. Please reset password."
        )

    if not is_password_correct:
        print("DEBUG: Password verification failed")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if payload.role == "Staff":
        if user.role not in ["Staff", "Receptionist"]:
            raise HTTPException(status_code=403, detail="Access denied: Invalid staff role")
    elif user.role != payload.role:
        # Keep strict matching for Admin, Patient, etc.
        raise HTTPException(status_code=403, detail="Role mismatch")
    # 4. Token generation
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