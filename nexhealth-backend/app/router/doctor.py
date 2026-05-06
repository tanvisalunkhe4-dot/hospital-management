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
    # Resolve the doctor record once
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
            models.Appointment.doctor_id == doctor.id,
            # NEW: Filter by hospital_id so patients from other clinics don't appear
            models.Appointment.hospital_id == doctor.hospital_id,
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

# ADD THIS NEW ENDPOINT FOR THE RESUME LOGIC
@router.get("/active-session/{staff_id}")
def check_active_consultation(staff_id: str, db: Session = Depends(get_db)):
    doctor = resolve_staff_record(staff_id, db)
    
    # Only look for a session that started TODAY
    active_row = (
        db.query(
            models.Appointment.id,
            models.Patient.id.label("patient_id"),
            (models.Patient.first_name + " " + models.Patient.last_name).label("patient_name"),
            models.Appointment.reason
        )
        .join(models.Patient, models.Appointment.patient_id == models.Patient.id)
        .filter(
            models.Appointment.doctor_id == doctor.id,
            models.Appointment.status == STATUS_IN_CONSULTATION,
            models.Appointment.appointment_date == date.today() # Strict Date Filter
        )
        .first()
    )
    
    if active_row:
        return {
            "id": active_row.id,
            "patient_id": active_row.patient_id,
            "patient_name": active_row.patient_name,
            "reason": active_row.reason
        }
    return None

@router.post("/consultation/start/{appointment_id}")
def start_consultation(appointment_id: int, db: Session = Depends(get_db)):
    # 1. Get the appointment the doctor is trying to start
    target_appt = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    
    # 2. Check if the doctor ALREADY has a session active TODAY
    active_session = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == target_appt.doctor_id,
        models.Appointment.status == "In Consultation",
        models.Appointment.appointment_date == date.today() # <--- THE CRITICAL ADDITION
    ).first()

    if active_session:
        raise HTTPException(
            status_code=400, 
            detail="You already have an active consultation in progress for today."
        )

    # 3. If no active session today, proceed to start the new one
    target_appt.status = STATUS_IN_CONSULTATION
    db.commit()
    return {"status": "started"}

@router.post("/consultation/finish/{appointment_id}")
def finish_consultation(appointment_id: int, db: Session = Depends(get_db)):
    """
    1. Updates status to 'Completed' (Turns badge Blue in Receptionist view)
    2. Automatically creates a record in the Billing Queue
    """
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Update the status so the Receptionist sees the Blue badge
    appointment.status = STATUS_COMPLETED
    
    # Create the Billing record (Invoice)
    new_invoice = models.Invoice(
        patient_id=appointment.patient_id,
        hospital_id=appointment.hospital_id,
        doctor_id=appointment.doctor_id,
        appointment_id=appointment.id,
        amount=500.00,  # Or calculate based on doctor's consultation fee
        status="Pending"
    )
    
    try:
        db.add(new_invoice)
        db.commit()
        return {"status": "success", "message": "Consultation finalized and billed."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Transaction failed.")
        
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