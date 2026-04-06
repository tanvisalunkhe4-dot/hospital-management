from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import models
from app.schemas import patient_schema
from app.db.session import get_db
from passlib.context import CryptContext
import logging

# Setup for logging
router = APIRouter(prefix="/api/v1/receptionist", tags=["receptionist"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
logger = logging.getLogger(__name__)

@router.post("/register-patient", response_model=patient_schema.PatientResponse, status_code=status.HTTP_201_CREATED)
def register_patient(patient_in: patient_schema.PatientCreate, db: Session = Depends(get_db)):
    """
    Registers a new patient by creating an inactive User account and a linked Patient profile.
    The patient will set their own password later via an invitation link.
    """
    
    # 1. Check for existing user to prevent duplicates
    existing_user = db.query(models.User).filter(models.User.email == patient_in.email).first()
    if existing_user:
        logger.warning(f"Registration failed: Email {patient_in.email} already exists.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    try:
        # Process ABHA ID for database NULLs
        processed_abha_id = patient_in.abha_id if patient_in.abha_id and patient_in.abha_id.strip() != "" else None

        # 2. Create the User entry (Authentication Layer)
        # We set hashed_password to None because the patient sets it later.
        # is_active is set to False until they verify their account.
        new_user = models.User(
            email=patient_in.email,
            hashed_password=None, 
            role="Patient", 
            is_active=False,
            hospital_id=patient_in.hospital_id
        )
        db.add(new_user)
        db.flush()  # Get new_user.id for the profile link

        # 3. Create the Patient entry (Profile Layer)
        new_patient = models.Patient(
            user_id=new_user.id,
            hospital_id=patient_in.hospital_id,
            first_name=patient_in.first_name,
            last_name=patient_in.last_name,
            phone_number=patient_in.phone_number,
            date_of_birth=patient_in.date_of_birth,
            gender=patient_in.gender,
            address=patient_in.address,
            abha_id=processed_abha_id,
            visit_type=patient_in.visit_type,
            doctor_name=patient_in.doctor_name,
            status="Registered"
        )
        db.add(new_patient)
        
        # 4. Finalize the transaction
        db.commit()
        db.refresh(new_patient)
        
        logger.info(f"Successfully registered: {patient_in.first_name} under Hospital ID: {patient_in.hospital_id}")
        return new_patient

    except Exception as e:
        db.rollback() 
        logger.error(f"DATABASE ERROR during registration: {str(e)}")
        
        if "UniqueViolation" in str(e) and "abha_id" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This ABHA ID is already registered."
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database Error: {str(e)}"
        )

@router.get("/patients/search", response_model=list[patient_schema.PatientResponse])
def search_patients(query: str, db: Session = Depends(get_db)):
    """
    Search patient records by name or phone number.
    """
    patients = db.query(models.Patient).filter(
        (models.Patient.first_name.ilike(f"%{query}%")) | 
        (models.Patient.phone_number.contains(query))
    ).all()
    return patients

@router.get("/stats/{hosp_id}")
async def get_dashboard_stats(hosp_id: int, db: Session = Depends(get_db)):
    """
    Returns live statistics for the Receptionist Dashboard filtered by Hospital.
    """
    patient_count = db.query(models.Patient).filter(models.Patient.hospital_id == hosp_id).count()
    
    return {
        "total_patients": patient_count,
        "appointments_today": 0,
        "consultations": 0,
        "pending_bills": 0
    }

@router.get("/patients/recent", response_model=list[patient_schema.PatientResponse])
def get_recent_patients(db: Session = Depends(get_db)):
    """
    Fetches the latest 5 registered patients for the dashboard table.
    """
    return db.query(models.Patient).order_by(models.Patient.id.desc()).limit(5).all()