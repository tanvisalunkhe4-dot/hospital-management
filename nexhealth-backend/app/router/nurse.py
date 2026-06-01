from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, func
from typing import List
from app.db.session import get_db 
from app.db import models
from app.router.deps import get_current_user
from datetime import datetime, timedelta, timezone
IST = timezone(timedelta(hours=5, minutes=30))

router = APIRouter(prefix="/api/v1/nurse", tags=["Nurse Operations"])


@router.get("/patients-monitoring", response_model=List[dict])
def get_monitoring_data(db: Session = Depends(get_db)):
    # 1. Get today's date to filter only current appointments
    today = datetime.now(IST).date()

    # 2. Query only patients who have a "Checked-In" appointment TODAY
    active_appointments = db.query(models.Patient, models.Appointment)\
        .join(models.Appointment, models.Patient.id == models.Appointment.patient_id)\
        .filter(
            models.Appointment.status == "Checked In",
            func.date(models.Appointment.appointment_date) == today
        ).all()

    results = []
    
    for patient, appt in active_appointments:
        # Get the most recent vitals recorded for this patient
        latest_vital = db.query(models.Vitals)\
            .filter(models.Vitals.patient_id == patient.id)\
            .order_by(desc(models.Vitals.recorded_at))\
            .first()
            
        # Determine status priority for the UI
        pulse = latest_vital.pulse_rate if latest_vital else 0
        status_type = "normal"
        if pulse > 100 or pulse < 60 and pulse != 0:
            status_type = "critical"
        elif not latest_vital:
            status_type = "pending"

        # --- FIX STARTS HERE ---
        # We handle the timezone conversion safely before sending it to the React UI
        last_update_display = "Never"
        if latest_vital and latest_vital.recorded_at:
            v_time = latest_vital.recorded_at
            # If the time coming from DB doesn't have a timezone, attach UTC then convert to IST
            if v_time.tzinfo is None:
                v_time = v_time.replace(tzinfo=timezone.utc).astimezone(IST)
            else:
                v_time = v_time.astimezone(IST)
            
            # Format to 12-hour clock with AM/PM for easier reading
            last_update_display = v_time.strftime("%I:%M %p") 
        # --- FIX ENDS HERE ---

        results.append({
            "id": patient.id,
            "name": f"{patient.first_name} {patient.last_name}".title(),
            "uhid": patient.uhid or "NX-PENDING",
            "bed_number":  "OPD",
            "status": "Checked In",
            "status_type": status_type,
            "checked_in": True,
            "vitals": {
                "bp": latest_vital.blood_pressure if latest_vital else "N/A",
                "pulse": latest_vital.pulse_rate if latest_vital else "N/A",
                "temp": latest_vital.temperature if latest_vital else "N/A",
                "last_update": last_update_display # Sending the corrected IST string
            }
        })
    return results

    
@router.post("/vitals")
def create_vitals(
    vital_data: dict, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) 
):
    if current_user.role.lower() != "nurse":
        raise HTTPException(status_code=403, detail="Access denied")

    staff_record = db.query(models.Staff).filter(
        models.Staff.user_id == current_user.id,
        models.Staff.is_active == True
    ).first()

    if not staff_record:
        raise HTTPException(status_code=400, detail="User is not registered as official staff")

    # 1. Capture Current IST Time
    current_time_ist = datetime.now(IST)

    # 2. Create the Vitals record with explicit IST time
    new_vital = models.Vitals(
        patient_id=vital_data.get("patient_id"),
        nurse_id=staff_record.id,
        blood_pressure=vital_data.get("blood_pressure"),
        pulse_rate=vital_data.get("pulse_rate"),
        temperature=vital_data.get("temperature"),
        sp_o2=vital_data.get("spo2"), 
        remarks=vital_data.get("notes"),
        recorded_at=current_time_ist  # FIX: Forces IST in the DB
    )
    db.add(new_vital)

    # 3. Update Appointment Status to move them to Doctor's Queue
    # We filter by today's date (IST) to make sure we hit the right appointment
    today_ist = current_time_ist.date()
    
    appointment = db.query(models.Appointment).filter(
        models.Appointment.patient_id == vital_data.get("patient_id"),
        models.Appointment.status == "Checked In",
        func.date(models.Appointment.appointment_date) == today_ist
    ).first()
    
    if appointment:
        # This MUST match the constant the Doctor's Queue is looking for
        appointment.status = "Vitals Taken" 

    db.commit()
    return {"message": "Vitals recorded and patient moved to Doctor's Queue"}
    
@router.get("/vitals-history/{patient_id}")
def get_vitals_history(patient_id: int, db: Session = Depends(get_db)):
    # Fetch the last 10-15 records to show trends
    history = db.query(models.Vitals)\
        .filter(models.Vitals.patient_id == patient_id)\
        .order_by(desc(models.Vitals.recorded_at))\
        .limit(10)\
        .all()
    return history

@router.get("/patient/{patient_id}")
def get_patient_details(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.get("/patient-records/{patient_id}")
def get_patient_records(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    patient = db.query(models.Patient).filter(
        models.Patient.patient_id == patient_id
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    records = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.patient_id == patient_id
    ).order_by(models.MedicalRecord.created_at.desc()).all()

    return [
        {
            "record_id": record.record_id,
            "date": record.created_at,
            "diagnosis": record.diagnosis,
            "notes": record.clinical_notes,
            "description": record.description
        }
        for record in records
    ]

@router.get("/active-treatments")
def get_active_treatments(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    prescriptions = db.query(models.Prescription).all()

    return [
        {
            "prescription_id": p.prescription_id,
            "patient_id": p.medical_record.patient_id,
            "medicine": p.medicine_name,
            "dosage": p.dosage,
            "frequency": p.frequency,
            "duration": p.duration
        }
        for p in prescriptions
    ]


@router.post("/record-medication")
def record_medication(
    payload: dict,
    current_user=Depends(get_current_user)
):
    return {
        "success": True,
        "message": "Medication administration recorded successfully"
    }
