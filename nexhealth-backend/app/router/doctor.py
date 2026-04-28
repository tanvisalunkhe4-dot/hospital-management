from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date

# Absolute imports matching project structure
from app.db import models
from app.db.session import get_db

router = APIRouter(prefix="/api/v1/doctor", tags=["Doctor Portal"])

# --- HELPER: STAFF ID LOOKUP ---
def resolve_staff_to_user_id(staff_id: str, db: Session):
    """
    Production-level helper to find the internal User ID 
    based on the professional Staff ID provided by the UI.
    """
    user = db.query(models.User).filter(models.User.staff_id == staff_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Professional profile for {staff_id} not found."
        )
    return user.id

# --- 1. THE WAITING ROOM (Today's Queue) ---
@router.get("/queue/{staff_id}")
def get_doctor_queue(staff_id: str, db: Session = Depends(get_db)):
    """
    Fetches patients 'Checked In' for a specific staff member TODAY.
    Resolves the Staff ID to an Internal ID to filter appointments.
    """
    internal_id = resolve_staff_to_user_id(staff_id, db)
    today = date.today()
    
    queue = db.query(
        models.Appointment.id,
        models.Appointment.appointment_time,
        models.Appointment.reason,
        models.Patient.first_name,
        models.Patient.last_name,
        models.Patient.phone_number
    ).join(models.Patient, models.Appointment.patient_id == models.Patient.id)\
     .filter(
        models.Appointment.doctor_id == internal_id,
        models.Appointment.status == "Checked In",
        models.Appointment.appointment_date == today
    ).all()
    
    return [
        {
            "id": r.id,
            "patient_name": f"{r.first_name} {r.last_name}",
            "time": r.appointment_time.strftime("%H:%M") if r.appointment_time else "N/A",
            "reason": r.reason,
            "phone": r.phone_number
        } for r in queue
    ]

# --- 2. MY SCHEDULE (Full Agenda) ---
@router.get("/schedule/{staff_id}")
def get_doctor_schedule(staff_id: str, db: Session = Depends(get_db)):
    """
    Shows all appointments for this professional Staff ID for today.
    """
    internal_id = resolve_staff_to_user_id(staff_id, db)
    today = date.today()
    
    schedule = db.query(
        models.Appointment.id,
        models.Appointment.appointment_time,
        models.Appointment.status,
        models.Patient.first_name,
        models.Patient.last_name
    ).join(models.Patient, models.Appointment.patient_id == models.Patient.id)\
     .filter(
        models.Appointment.doctor_id == internal_id,
        models.Appointment.appointment_date == today
    ).order_by(models.Appointment.appointment_time.asc()).all()
    
    return [
        {
            "id": s.id,
            "patient_name": f"{s.first_name} {s.last_name}",
            "time": s.appointment_time.strftime("%H:%M") if s.appointment_time else "N/A",
            "status": s.status
        } for s in schedule
    ]

# --- 3. CONSULTATION LOGIC ---
@router.post("/consultation/start/{appointment_id}")
def start_consultation(appointment_id: int, db: Session = Depends(get_db)):
    """
    Transitions appointment to 'In Consultation' status.
    """
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment.status = "In Consultation"
    db.commit()
    
    return {"status": "success", "message": f"Started visit for appointment {appointment_id}"}

# --- 4. MEDICAL RECORDS (Archive) ---
@router.get("/medical-records/all")
def get_all_records(db: Session = Depends(get_db)):
    """
    Fetches all historical records with patient details joined.
    """
    results = db.query(
        models.MedicalRecord.id,
        models.Patient.first_name,
        models.Patient.last_name,
        models.MedicalRecord.diagnosis,
        models.MedicalRecord.created_at
    ).join(models.Patient, models.MedicalRecord.patient_id == models.Patient.id).all()

    return [
        {
            "id": f"NX-{r.id}",
            "patient_name": f"{r.first_name} {r.last_name}",
            "visit_date": r.created_at.strftime("%Y-%m-%d") if r.created_at else "N/A",
            "diagnosis": r.diagnosis
        } for r in results
    ]