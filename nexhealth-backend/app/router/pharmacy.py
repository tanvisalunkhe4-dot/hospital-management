from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

# Corrected imports based on your project structure
from app.db.session import get_db
from app.db.models import Appointment, Prescription, Patient, MedicalRecord

router = APIRouter(prefix="/api/v1/pharmacy", tags=["Pharmacy"])

# 1. GET PENDING FOR PHARMACY
@router.get("/pending/{hospital_id}")
async def get_pharmacy_queue(hospital_id: int, db: Session = Depends(get_db)):
    # Fetch appointments where status is "Pending-Pharmacy"
    orders = db.query(Appointment).filter(
        Appointment.hospital_id == hospital_id,
        Appointment.status == "Pending-Pharmacy"
    ).all()
    
    # We use a list comprehension to build the response
    return [{
        "appt_id": a.id,
        "patient_id": a.patient_id,
        "patient_name": f"{a.patient.first_name} {a.patient.last_name}",
        # Use created_at since updated_at isn't in your models.py
        "time": a.created_at.strftime("%H:%M") if a.created_at else "N/A",
        "prescriptions": [
            {
                "name": p.medicine_name, 
                "dosage": p.dosage, 
                "frequency": p.frequency,
                "instructions": p.instructions
            } for p in db.query(Prescription).filter(Prescription.hospital_id == hospital_id).join(
                MedicalRecord, Prescription.medical_record_id == MedicalRecord.id
            ).filter(MedicalRecord.appointment_id == a.id).all()
        ]
    } for a in orders]

# 2. VERIFY & MOVE TO BILLING
@router.patch("/verify/{appt_id}")
async def verify_prescription(appt_id: int, db: Session = Depends(get_db)):
    appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Update status to move it to the Receptionist's Billing dashboard
    appt.status = "Pending-Billing"
    
    try:
        db.commit()
        return {"status": "success", "message": "Prescription verified. Patient moved to Billing queue."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# 3. GET PENDING FOR BILLING (Used by Receptionist Dashboard)
@router.get("/billing-queue/{hospital_id}")
async def get_billing_queue(hospital_id: int, db: Session = Depends(get_db)):
    orders = db.query(Appointment).filter(
        Appointment.hospital_id == hospital_id,
        Appointment.status == "Pending-Billing"
    ).all()
    
    return [{
        "appt_id": a.id,
        "patient_id": a.patient_id,
        "patient_name": f"{a.patient.first_name} {a.patient.last_name}",
        "consultation_fee": 500.0, 
        "status": a.status
    } for a in orders]