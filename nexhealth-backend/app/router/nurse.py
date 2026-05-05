from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Patient, Vital
from sqlalchemy import desc

router = APIRouter(prefix="/api/v1/nurse", tags=["Nurse Operations"])

@router.get("/patients-monitoring")
def get_monitoring_data(db: Session = Depends(get_db)):
    # 1. Fetch all active patients
    patients = db.query(Patient).all()
    
    results = []
    for patient in patients:
        # 2. Get the most recent vital record for this specific patient
        latest_vital = db.query(Vital)\
            .filter(Vital.patient_id == patient.id)\
            .order_by(desc(Vital.recorded_at))\
            .first()
            
        results.append({
            "id": patient.id,
            "name": patient.name,
            "bed_number": patient.bed_number,
            "status": patient.status,
            "latest_bp": latest_vital.blood_pressure if latest_vital else "N/A",
            "latest_pulse": latest_vital.pulse if latest_vital else None,
            "latest_temp": latest_vital.temperature if latest_vital else None,
        })
    
    return results