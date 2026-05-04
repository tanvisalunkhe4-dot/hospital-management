from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import date

from app.db import models
from app.db.session import get_db

router = APIRouter(prefix="/api/v1/doctor", tags=["Doctor Portal"])

# Standardized Status Constants
STATUS_CHECKED_IN = "Checked In"
STATUS_IN_CONSULTATION = "In Consultation"

def resolve_staff_record(staff_id: str, db: Session) -> models.Staff:
    staff = db.query(models.Staff).filter(models.Staff.staff_id == staff_id).first()
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Staff profile for {staff_id} not found.",
        )
    return staff

# --- doctor.py ---
@router.get("/queue/{staff_id}")
def get_doctor_queue(staff_id: str, db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    doctor = resolve_staff_record(staff_id, db)

    rows = (
        db.query(
            models.Appointment.id.label("id"), # Use 'id' to match frontend patient.id
            models.Appointment.appointment_time,
            models.Appointment.reason,
            models.Patient.id.label("patient_id"),
            (models.Patient.first_name + " " + models.Patient.last_name).label("patient_name"),
        )
        .join(models.Patient, models.Appointment.patient_id == models.Patient.id)
        .filter(
            models.Appointment.doctor_name == doctor.full_name,
            models.Appointment.status == STATUS_CHECKED_IN,
            models.Appointment.appointment_date == date.today(),
        )
        .order_by(models.Appointment.appointment_time.asc())
        .all()
    )

    return [
        {
            "id": r.id,
            "patient_id": r.patient_id,
            "patient_name": r.patient_name,
            "reason": r.reason,
            "time": r.appointment_time.strftime("%H:%M") if r.appointment_time else "N/A",
        }
        for r in rows
    ]
@router.post("/consultation/start/{appointment_id}")
def start_consultation(appointment_id: int, db: Session = Depends(get_db)):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appointment.status = STATUS_IN_CONSULTATION
    db.commit()
    return {"status": "success", "message": f"Started visit for appointment {appointment_id}"}

@router.get("/medical-records/all")
def get_all_records(db: Session = Depends(get_db)):
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
            "id": f"NX-{r.id}",
            "patient_name": f"{r.first_name} {r.last_name}",
            "visit_date": r.created_at.strftime("%Y-%m-%d") if r.created_at else "N/A",
            "diagnosis": r.diagnosis,
        }
        for r in results
    ]