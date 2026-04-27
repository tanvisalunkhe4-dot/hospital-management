from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from sqlalchemy import or_
import datetime
import random
import string
from sqlalchemy import func  # Add this line
from ..db.session import get_db
from app.db.models import User
from ..db import models
from ..schemas.auth_schema import SignupRequest, LoginRequest, LoginResponse
from app.schemas.auth_schema import PasswordChange
from app.dependancy import get_current_active_user
import os
import pyotp
from app.dependancy import get_current_active_user
router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])

PWD_CONTEXT = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

async def get_current_admin(current_user: User = Depends(get_current_active_user)):
    if current_user.role != "Admin":
        raise HTTPException(
            status_code=403, 
            detail="The user does not have administrative privileges"
        )
    return current_user

def get_password_hash(password: str):
    return PWD_CONTEXT.hash(password)


@router.get("/me")
def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "staff_id": current_user.staff_id,
        "role": current_user.role,
        "hospital_id": current_user.hospital_id,
        "profile_url": current_user.profile_url,
        "is_2fa_enabled": current_user.is_2fa_enabled,
    }


@router.patch("/me")
def update_current_user_profile(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    full_name = payload.get("full_name")
    if full_name is not None:
        current_user.full_name = str(full_name).strip() or None

    db.commit()
    db.refresh(current_user)

    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "staff_id": current_user.staff_id,
        "role": current_user.role,
        "hospital_id": current_user.hospital_id,
        "profile_url": current_user.profile_url,
        "is_2fa_enabled": current_user.is_2fa_enabled,
    }


def generate_staff_id(role: str):
    prefix = "ADM" if role == 'Admin' else "STF"
    return f"NX-{prefix}-{''.join(random.choices(string.digits, k=4))}"

@router.get("/2fa/setup")
def setup_2fa(
    current_user: User = Depends(get_current_active_user), 
    db: Session = Depends(get_db) # 1. Add the database session
):
    # 2. Generate the secret
    secret = pyotp.random_base32()
    
    # 3. 🟢 SAVE the secret to the database!
    # Ensure your User model has a 'two_factor_secret' column
    current_user.two_factor_secret = secret 
    db.commit()
    
    # 4. Create the QR code link
    uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=current_user.email, 
        issuer_name="NexHealth"
    )
    
    # Return both so the frontend can show the QR code
    return {"secret": secret, "qr_uri": uri}

@router.post("/2fa/verify")
def verify_2fa(
    payload: dict, 
    current_user: models.User = Depends(get_current_active_user), 
    db: Session = Depends(get_db)
):
    # 1. Extract the code from the frontend request
    otp_code = payload.get("code")
    
    if not otp_code:
        raise HTTPException(status_code=400, detail="OTP code is required")

    # 2. Retrieve the secret we saved during the GET /2fa/setup step
    user_secret = current_user.two_factor_secret
    
    if not user_secret:
        raise HTTPException(
            status_code=404, 
            detail="2FA secret not found. Please re-scan the QR code."
        )

    # 3. Use pyotp to verify the code against the stored secret
    totp = pyotp.TOTP(user_secret)
    
    # verify() returns True if the code is correct for the current time
    if totp.verify(otp_code):
        # 4. Success! Permanently enable 2FA for this user
        current_user.is_2fa_enabled = True
        db.commit()
        return {"message": "NexHealth Vault Secured! 2FA is now active."}
    else:
        # 5. Fail! The code was wrong or expired
        raise HTTPException(
            status_code=400, 
            detail="Invalid or expired OTP code. Please try again."
        )

@router.post("/signup")
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    identifier = payload.identifier.strip().lower()

    # 1. Standard Duplicate check (Prevents double signups)
    existing_user = db.query(models.User).filter(
        func.lower(models.User.email) == identifier
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=400, 
            detail=f"User with identifier {payload.identifier} already exists."
        )

    # 2. GATEKEEPER LOGIC: Check if Receptionist already registered this patient
    receptionist_record = None
    if payload.role == "Patient":
        receptionist_record = db.query(models.Patient).filter(
            models.Patient.phone_number == payload.identifier.strip(),
            models.Patient.user_id == None
        ).first()

        if not receptionist_record:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="No registration found. Please visit the hospital reception to register your details first."
            )

    # 3. Prepare common variables
    linked_db_id = receptionist_record.hospital_id if receptionist_record else None
    new_staff_id = None

    # 4. Role-Specific Logic (Admin/Staff only)
    if payload.role in ['Admin', 'Staff']:
        hosp = db.query(models.Hospital).filter(models.Hospital.hfr_id == payload.hospital_id).first()
        if not hosp:
            raise HTTPException(status_code=404, detail="Hospital Registration ID not found")
        linked_db_id = hosp.id

        while True:
            candidate_id = generate_staff_id(payload.role)
            id_exists = db.query(models.User).filter(models.User.staff_id == candidate_id).first()
            if not id_exists:
                new_staff_id = candidate_id
                break

    # 5. Create the User
    new_user = models.User(
        email=identifier,
        role=payload.role,
        staff_id=new_staff_id, 
        hashed_password=get_password_hash(payload.password),
        hospital_id=linked_db_id,
        is_active=True 
    )

    try:
        db.add(new_user)
        db.flush() # Generate ID

        # 6. Finalize the Bridge (Link the patient record)
        if payload.role == "Patient" and receptionist_record:
            receptionist_record.user_id = new_user.id
            
        db.commit()
        db.refresh(new_user)
    except Exception as e:
        db.rollback()
        logger.error(f"Signup Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error during registration")

    return {
        "message": "User created successfully",
        "staff_id": new_user.staff_id
    }

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    search_identifier = payload.identifier.strip()
    hosp_db_id = None

    # --- 1. HOSPITAL VALIDATION ---
    # Triggered for hospital-linked workforce roles
    if payload.role in ['Admin', 'Staff', 'Receptionist', 'Nurse']:
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

    entered_password = payload.password.strip()
    
    # Check 1: Database Password Verification (Secure Hashing)
    # This works for any password updated via your 'change-password' route
    is_db_password = False
    if user.hashed_password:
        try:
            # PWD_CONTEXT.verify handles the comparison of plain text vs bcrypt hash
            is_db_password = PWD_CONTEXT.verify(entered_password, user.hashed_password)
        except Exception:
            # Fallback for any legacy plain-text passwords still in the DB
            is_db_password = (entered_password == user.hashed_password.strip())

    # Check 2: Master Password (ONLY for Admin/Staff, NOT for Patients)
    DEFAULT_DEMO_PASSWORD = "admin123"
    is_master_password = (entered_password == DEFAULT_DEMO_PASSWORD)

    # FINAL SECURITY GATE:
    if user.role == "Patient":
        # Patients MUST use their actual database password
        if not is_db_password:
            print(f"DEBUG: Patient password verification failed for {search_identifier}")
            raise HTTPException(status_code=401, detail="Invalid credentials")
    else:
        # Admins/Staff can use either their real pass OR the demo pass
        if not (is_db_password or is_master_password):
            print(f"DEBUG: Staff password verification failed for {search_identifier}")
            raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # --- 4. ROLE PERMISSIONS GUARD ---
    # Ensure the user is logging in with the correct role selected in the UI
    if payload.role in ["Staff", "Receptionist", "Nurse"]:
        if user.role not in ["Staff", "Receptionist", "Nurse"]:
            raise HTTPException(status_code=403, detail="Access denied: Invalid staff role")
    
    elif user.role != payload.role:
        print(f"DEBUG: Role mismatch. Sent: {payload.role}, DB: {user.role}")
        raise HTTPException(status_code=403, detail="Role mismatch")

    # --- 5. PATIENT PROFILE BACKFILL ---
    if user.role == "Patient":
        existing_patient_profile = (
            db.query(models.Patient).filter(models.Patient.user_id == user.id).first()
        )
        if not existing_patient_profile:
            # Create a profile if it doesn't exist for legacy users
            identifier_value = user.email or search_identifier
            fallback_name = identifier_value.split("@")[0] if "@" in identifier_value else "Patient"

            db.add(
                models.Patient(
                    user_id=user.id,
                    first_name=fallback_name.strip(),
                    last_name="User",
                )
            )
            db.commit()
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