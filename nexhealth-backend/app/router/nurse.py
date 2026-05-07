from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, func
from typing import List
from app.db.session import get_db 
from app.db import models
from app.router.deps import get_current_user
from datetime import datetime
router = APIRouter(prefix="/api/v1/nurse", tags=["Nurse Operations"])


@router.get("/patients-monitoring", response_model=List[dict])
def get_monitoring_data(db: Session = Depends(get_db)):
    # 1. Get today's date to filter only current appointments
    today = datetime.now().date()

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

        results.append({
            "id": patient.id,
            "name": f"{patient.first_name} {patient.last_name}".title(),
            "uhid": patient.uhid or "NX-PENDING",
            "bed_number":  "OPD", # Link to the ward assigned at check-in
            "status": "Checked In", # Matches the receptionist's action
            "status_type": status_type,
            "checked_in": True, # For frontend filtering
            "vitals": {
                "bp": latest_vital.blood_pressure if latest_vital else "N/A",
                "pulse": latest_vital.pulse_rate if latest_vital else "N/A",
                "temp": latest_vital.temperature if latest_vital else "N/A",
                "last_update": latest_vital.recorded_at.strftime("%H:%M") if latest_vital else "Never"
            }
        })
    return results

@router.post("/vitals")
def create_vitals(
    vital_data: dict, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) 
):
    # 1. Role Check (Keep this, it's good!)
    if current_user.role.lower() != "nurse":
        raise HTTPException(status_code=403, detail="Access denied")

    # 2. Find the Staff record for this User
    # We look in the 'staff' table (seen in image_017ec5.jpg) where user_id matches
    staff_record = db.query(models.Staff).filter(models.Staff.user_id == current_user.id).first()

    if not staff_record:
        raise HTTPException(status_code=400, detail="User is not registered as official staff")

    # 3. Create the Vitals record using the STAFF ID
    new_vital = models.Vitals(
        patient_id=vital_data.get("patient_id"),
        nurse_id=staff_record.id,
        blood_pressure=vital_data.get("blood_pressure"),
        pulse_rate=vital_data.get("pulse_rate"),
        temperature=vital_data.get("temperature"),
        sp_o2=vital_data.get("spo2"), 
        remarks=vital_data.get("notes") 
    )
    
    appointment = db.query(models.Appointment).filter(
        models.Appointment.patient_id == vital_data.get("patient_id"),
        models.Appointment.status == "Checked In"
    ).first()
    
    if appointment:
        appointment.status = "Vitals Taken" # Or "Ready for Doctor"

    db.add(new_vital)
    db.commit()
    return {"message": "Vitals recorded and patient ready for doctor"}

    
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

