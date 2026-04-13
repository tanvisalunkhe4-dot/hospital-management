from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import datetime

# Absolute imports matching the receptionist.py style to fix ModuleNotFoundError
from app.db import models
from app.db.session import get_db

# Note: Ensure these schemas exist in your project structure
# from app.schemas import patient_schema, appointment_schema

router = APIRouter(prefix="/api/v1/doctor", tags=["Doctor Portal"])

@router.get("/queue/{doctor_id}")
def get_doctor_queue(doctor_id: int, db: Session = Depends(get_db)):
    """
    Fetches all patients currently 'Checked In' for a specific doctor.
    """
    # Using models.Appointment to ensure the correct path is used
    queue = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == doctor_id,
        models.Appointment.status == "Checked In"
    ).all()
    
    return queue

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

@router.get("/medical-records/all")
def get_all_records(db: Session = Depends(get_db)):
    """
    Fetches medical records and joins with patients for the UI dashboard.
    """
    # Joining MedicalRecord with Patient to get the names for the frontend
    results = db.query(
        models.MedicalRecord.id,
        models.Patient.first_name,
        models.Patient.last_name,
        models.MedicalRecord.diagnosis,
        models.MedicalRecord.created_at
    ).join(models.Patient, models.MedicalRecord.patient_id == models.Patient.id).all()

    # Formatted specifically to match the React DataView columns
    return [
        {
            "id": f"NX-{r.id}",
            "patient_name": f"{r.first_name} {r.last_name}",
            "visit_date": r.created_at.strftime("%Y-%m-%d") if r.created_at else "N/A",
            "diagnosis": r.diagnosis
        } for r in results
    ]