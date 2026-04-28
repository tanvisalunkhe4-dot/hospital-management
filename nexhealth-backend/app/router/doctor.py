from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date # Added for today's filtering

# Absolute imports matching the project structure
from app.db import models
from app.db.session import get_db

router = APIRouter(prefix="/api/v1/doctor", tags=["Doctor Portal"])

# --- 1. THE WAITING ROOM (Today's Queue) ---
@router.get("/queue/{doctor_id}")
def get_doctor_queue(doctor_id: int, db: Session = Depends(get_db)):
    """
    Fetches all patients currently 'Checked In' for a specific doctor
    ONLY for the current date. Resolves conflicts with past test data.
    """
    today = date.today()
    
    # Joining with Patient to get names directly for the queue UI
    queue = db.query(
        models.Appointment.id,
        models.Appointment.appointment_time,
        models.Appointment.reason,
        models.Patient.first_name,
        models.Patient.last_name,
        models.Patient.phone_number
    ).join(models.Patient, models.Appointment.patient_id == models.Patient.id)\
     .filter(
        models.Appointment.doctor_id == doctor_id,
        models.Appointment.status == "Checked In",
        models.Appointment.appointment_date == today # Strict Today Filter
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

# --- 2. MY SCHEDULE (Today's Full Agenda) ---
@router.get("/schedule/{doctor_id}")
def get_doctor_schedule(doctor_id: int, db: Session = Depends(get_db)):
    """
    Shows all appointments scheduled for the doctor today, 
    regardless of whether they have checked in yet.
    """
    today = date.today()
    
    schedule = db.query(
        models.Appointment.id,
        models.Appointment.appointment_time,
        models.Appointment.status,
        models.Patient.first_name,
        models.Patient.last_name
    ).join(models.Patient, models.Appointment.patient_id == models.Patient.id)\
     .filter(
        models.Appointment.doctor_id == doctor_id,
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
    Moves a patient from 'Checked In' to 'In Consultation'.
    """
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment.status = "In Consultation"
    db.commit()
    
    return {"status": "success", "message": f"Started visit for appointment {appointment_id}"}

# --- 4. MEDICAL RECORDS (Historical Archive) ---
@router.get("/medical-records/all")
def get_all_records(db: Session = Depends(get_db)):
    """
    Fetches all historical records. No date filter here because 
    doctors need to see the full patient history.
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