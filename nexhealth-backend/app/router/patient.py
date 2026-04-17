from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

# Import your shared logic
from app.db.session import get_db
from app.router.deps import get_current_active_user
from app.db.models import Patient
from app.db.models import Patient, User, Appointment, MedicalRecord
from app.schemas.auth_schema import (
    PatientProfile, 
    PatientUpdate, 
    AppointmentRead, 
    MedicalRecordRead,
    PatientDashboardSummary
)
# ✅ Use the specific name you used in main.py
patient_router = APIRouter()


def get_or_create_patient_profile(db: Session, current_user: User) -> Patient:
    """Guarantee a patient profile row exists for authenticated Patient users."""
    if current_user.role != "Patient":
        raise HTTPException(
            status_code=403,
            detail=f"Access denied: Patient role required (current role: {current_user.role})",
        )

    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if patient:
        return patient

    identifier_value = current_user.email or current_user.phone or "patient"
    fallback_name = identifier_value.split("@")[0] if "@" in identifier_value else identifier_value
    fallback_name = (fallback_name or "Patient").strip()

    patient = Patient(
        user_id=current_user.id,
        first_name=fallback_name,
        last_name="User",
        hospital_id=current_user.hospital_id,
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

# --- 1. PROFILE ENDPOINTS ---

@patient_router.get("/profile", response_model=PatientProfile)
def read_patient_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retrieve the digital identity of the logged-in patient."""
    patient = get_or_create_patient_profile(db, current_user)
    return patient

@patient_router.patch("/profile", response_model=PatientProfile)
def update_patient_profile(
    patient_in: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update patient contact or address details."""
    patient = get_or_create_patient_profile(db, current_user)
    
    update_data = patient_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(patient, field, value)
    
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

# --- 2. APPOINTMENT ENDPOINTS ---

@patient_router.get("/appointments", response_model=List[AppointmentRead])
def read_patient_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    upcoming: bool = True
):
    """Fetch appointments across the NexHealth network."""
    patient = get_or_create_patient_profile(db, current_user)

    query = db.query(Appointment).filter(Appointment.patient_id == patient.id)
    if upcoming:
        query = query.filter(Appointment.appointment_date >= datetime.now())
    
    return query.order_by(Appointment.appointment_date.asc()).all()

# --- 3. MEDICAL VAULT (RECORDS) ---

@patient_router.get("/medical-records", response_model=List[MedicalRecordRead])
def read_patient_medical_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Access clinical documents linked to ABHA ID."""
    patient = get_or_create_patient_profile(db, current_user)
    return db.query(MedicalRecord).filter(MedicalRecord.patient_id == patient.id).all()

# --- 4. DASHBOARD OVERVIEW (AGGREGATED) ---

@patient_router.get("/dashboard-summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """One-call summary for the Patient Overview dashboard."""
    patient = get_or_create_patient_profile(db, current_user)
    
    next_appt = db.query(Appointment).filter(
        Appointment.patient_id == patient.id,
        Appointment.appointment_date >= datetime.now()
    ).order_by(Appointment.appointment_date.asc()).first()
    
    record_count = db.query(MedicalRecord).filter(MedicalRecord.patient_id == patient.id).count()
    
    return {
        "next_appointment": next_appt.appointment_date if next_appt else None,
        "blood_group": patient.blood_group,
        "pending_reports": record_count,
        "abha_linked": bool(patient.abha_id),
        "uhid": patient.uhid
    }