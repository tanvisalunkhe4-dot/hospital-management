from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import date
from app.db import models
from app.db.session import get_db

router = APIRouter(prefix="/api/v1/doctor", tags=["Doctor Portal"])

STATUS_SCHEDULED = "Scheduled"
STATUS_CHECKED_IN = "Checked In"
STATUS_IN_CONSULTATION = "In Consultation"
STATUS_COMPLETED = "Completed"

def resolve_staff_record(staff_id: str, db: Session) -> models.Staff:
    """Helper to find internal database ID using the public staff_id."""
    staff = db.query(models.Staff).filter(models.Staff.staff_id == staff_id).first()
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Staff profile for {staff_id} not found.",
        )
    return staff

@router.get("/queue/{staff_id}")
def get_doctor_queue(staff_id: str, db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """
    Fetches the live 'Waiting Room' queue for a specific doctor.
    Shows only patients who have been 'Checked In' by the receptionist today.
    """
    doctor = resolve_staff_record(staff_id, db)

    rows = (
        db.query(
            models.Appointment.id.label("appt_id"),
            models.Appointment.appointment_time,
            models.Appointment.reason,
            models.Patient.id.label("patient_id"),
            (models.Patient.first_name + " " + models.Patient.last_name).label("patient_name"),
        )
        .join(models.Patient, models.Appointment.patient_id == models.Patient.id)
        .filter(
            # Filtering by ID is safer than doctor_name strings
            models.Appointment.doctor_id == doctor.id, 
            models.Appointment.status == STATUS_CHECKED_IN,
            models.Appointment.appointment_date == date.today(),
        )
        .order_by(models.Appointment.appointment_time.asc())
        .all()
    )

    return [
        {
            "id": r.appt_id,
            "patient_id": r.patient_id,
            "patient_name": r.patient_name,
            "reason": r.reason,
            "time": r.appointment_time.strftime("%H:%M") if r.appointment_time else "N/A",
        }
        for r in rows
    ]

@router.post("/consultation/start/{appointment_id}")
def start_consultation(appointment_id: int, db: Session = Depends(get_db)):
    """
    Moves a patient from 'Checked In' to 'In Consultation'.
    This triggers the patient to move from the Queue to the Active Visit view.
    """
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appointment.status = STATUS_IN_CONSULTATION
    
    try:
        db.commit()
        return {"status": "success", "message": f"Started visit for appointment {appointment_id}"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update consultation status.")

@router.get("/medical-records/all")
def get_all_records(db: Session = Depends(get_db)):
    """Fetches full clinical history for the Doctor's record archive."""
    results = (
        db.query(
            models.MedicalRecord.id,
            models.Patient.first_name,
            models.Patient.last_name,
            models.MedicalRecord.diagnosis,
            models.MedicalRecord.created_at,
        )
        .join(models.Patient, models.MedicalRecord.patient_id == models.Patient.id)
        .all()
    )

    return [
        {
            "id": f"NX-{r.id}", # Standardized Autonex ID format
            "patient_name": f"{r.first_name} {r.last_name}",
            "visit_date": r.created_at.strftime("%Y-%m-%d") if r.created_at else "N/A",
            "diagnosis": r.diagnosis,
        }
        for r in results
    ]