from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from pydantic import BaseModel

# Project imports
from app.db.session import get_db
from app.db.models import Appointment, Prescription, Patient, MedicalRecord

router = APIRouter(prefix="/api/v1/pharmacy", tags=["Pharmacy"])

# --- Request Schemas ---

class MedicineVerifyItem(BaseModel):
    id: int
    price: float
    is_available: bool

class PharmacyVerifyRequest(BaseModel):
    medicines: List[MedicineVerifyItem]

# --- Endpoints ---

# 1. GET PENDING FOR PHARMACY
@router.get("/pending/{hospital_id}")
async def get_pharmacy_queue(hospital_id: int, db: Session = Depends(get_db)):
    """
    Fetches patients waiting for medicine pricing and availability checks.
    """
    # CRITICAL: Ensure the status string matches exactly what the Doctor router sets.
    orders = db.query(Appointment).filter(
        Appointment.hospital_id == hospital_id,
        Appointment.status == "Pending-Pharmacy" 
    ).all()
    
    response = []
    for a in orders:
        # Fetch prescriptions specifically linked to this appointment's medical record
        prescriptions = db.query(Prescription).join(
            MedicalRecord, Prescription.medical_record_id == MedicalRecord.id
        ).filter(MedicalRecord.appointment_id == a.id).all()

        response.append({
            "appt_id": a.id,
            "patient_id": a.patient_id,
            "patient_name": f"{a.patient.first_name} {a.patient.last_name}",
            "time": a.created_at.strftime("%H:%M") if a.created_at else "N/A",
            "prescriptions": [
    {
        "id": p.id,
        "name": p.medicine_name, 
        "dosage": p.dosage, 
        "frequency": p.frequency,
        "instructions": p.instructions,
        "is_available": p.is_available, # Add this
        "price": p.price # Add this so the UI shows the price saved during doctor's consultation
    } for p in prescriptions
]
        })
    
    return response

# 2. VERIFY, PRICE, & MOVE TO BILLING
@router.patch("/verify/{appt_id}")
async def verify_prescription(
    appt_id: int, 
    data: PharmacyVerifyRequest, 
    db: Session = Depends(get_db)
):
    """
    Updates medicine prices and availability, calculates totals, 
    and moves the patient to the billing queue.
    """
    # 1. Fetch the appointment
    appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    total_medicine_cost = 0.0
    
    try:
        # 2. Update each medicine based on pharmacist input
        for med_item in data.medicines:
            db_med = db.query(Prescription).filter(Prescription.id == med_item.id).first()
            
            if db_med:
                # Update availability and price in the database
                db_med.is_available = med_item.is_available
                
                # If available, set the verified price and add to total
                if med_item.is_available:
                    db_med.price = med_item.price
                    # Assuming price is per prescription entry
                    total_medicine_cost += med_item.price
                else:
                    # If not available, we should zero out the price for this specific bill
                    db_med.price = 0.0

        # 3. Update Appointment Status
        # Moving to 'Pending-Billing' makes it visible on the Receptionist/Billing dashboard
        appt.status = "Pending-Billing"
        
        # 4. Finalize Database Transaction
        db.commit()

        return {
            "status": "success", 
            "message": f"Verified {len(data.medicines)} items. Moved to Billing.",
            "data": {
                "appt_id": appt_id,
                "patient_name": f"{appt.patient.first_name} {appt.patient.last_name}",
                "total_billable_amount": total_medicine_cost,
                "next_step": "Receptionist Billing"
            }
        }

    except Exception as e:
        db.rollback()
        # Log the error to your terminal for debugging
        print(f"========== PHARMACY VERIFY ERROR ==========")
        print(f"Error: {str(e)}")
        print(f"===========================================")
        raise HTTPException(
            status_code=500, 
            detail=f"Internal Server Error: {str(e)}"
        )
# 3. GET PENDING FOR BILLING (Used by Receptionist Dashboard)
@router.get("/billing-queue/{hospital_id}")
async def get_billing_queue(hospital_id: int, db: Session = Depends(get_db)):
    """
    Fetches all patients waiting for the receptionist to collect payment.
    """
    orders = db.query(Appointment).filter(
        Appointment.hospital_id == hospital_id,
        Appointment.status == "Pending-Billing"
    ).all()
    
    return [{
        "appt_id": a.id,
        "patient_id": a.patient_id,
        "patient_name": f"{a.patient.first_name} {a.patient.last_name}",
        "consultation_fee": 500.0, # Default value; ideally fetch from Staff model
        "status": a.status
    } for a in orders]


@router.get("/final-bill/{appt_id}")
async def get_bill_details(appt_id: int, db: Session = Depends(get_db)):
    appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
    
    # 1. Get Doctor's Consultation Fee (linked via Staff/Doctor model)
    # If not dynamic yet, use a default or fetch from appt.doctor.doctor_profile
    consultation_fee = 500.0 

    # 2. Get Verified Medicines (Only those marked 'is_available')
    prescriptions = db.query(Prescription).join(MedicalRecord).filter(
        MedicalRecord.appointment_id == appt_id,
        Prescription.is_available == True
    ).all()
    
    # 3. Get Lab Requests
    labs = db.query(LabRequest).filter(LabRequest.appointment_id == appt_id).all()

    return {
        "patient_name": f"{appt.patient.first_name} {appt.patient.last_name}",
        "doctor_name": appt.doctor_name,
        "consultation_fee": consultation_fee,
        "medicines": [{"name": p.medicine_name, "price": p.price} for p in prescriptions],
        "labs": [{"test": l.test_name, "price": l.price_at_request} for l in labs],
        "total_amount": consultation_fee + sum(p.price for p in prescriptions) + sum(l.price_at_request for l in labs)
    }