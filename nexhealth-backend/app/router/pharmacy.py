from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from pydantic import BaseModel

# Project imports
from app.db.session import get_db
from app.db.models import Appointment, Prescription, Patient, MedicalRecord, LabRequest, MedicineCatalog

router = APIRouter(prefix="/api/v1/pharmacy", tags=["Pharmacy"])

# --- Request Schemas ---

class MedicineVerifyItem(BaseModel):
    id: int
    price: float
    is_available: bool

class PharmacyVerifyRequest(BaseModel):
    medicines: List[MedicineVerifyItem]
    status: str 

# --- Endpoints ---

# 1. GET PENDING FOR PHARMACY (Dynamic for Queue & Dispensing)
@router.get("/pending/{hospital_id}")
async def get_pharmacy_queue(
    hospital_id: int, 
    status: str = "Pending-Pharmacy", 
    db: Session = Depends(get_db)
):
    orders = db.query(Appointment).filter(
        Appointment.hospital_id == hospital_id,
        Appointment.status == status
    ).all()
    
    response = []
    for a in orders:
        prescriptions = db.query(Prescription).join(
            MedicalRecord, Prescription.medical_record_id == MedicalRecord.id
        ).filter(MedicalRecord.appointment_id == a.id).all()

        response.append({
            "appt_id": a.id,
            "patient_id": a.patient_id,
            "patient_name": f"{a.patient.first_name} {a.patient.last_name}",
            "doctor_name": a.doctor_name if hasattr(a, 'doctor_name') else "N/A",
            "time": a.created_at.strftime("%H:%M") if a.created_at else "N/A",
            "prescriptions": [
                {
                    "id": p.id,
                    "medicine_name": p.medicine_name, 
                    "dosage": p.dosage, 
                    "frequency": p.frequency,
                    "quantity": p.quantity, # Added quantity for math
                    "instructions": p.instructions,
                    "is_available": p.is_available,
                    "price": p.price
                } for p in prescriptions
            ]
        })
    
    return response

# 2. VERIFY / DISPENSE / UPDATE STATUS + DEDUCT STOCK
@router.patch("/verify/{appt_id}")
async def verify_prescription(
    appt_id: int, 
    data: PharmacyVerifyRequest, 
    db: Session = Depends(get_db)
):
    appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    try:
        for med_item in data.medicines:
            db_med = db.query(Prescription).filter(Prescription.id == med_item.id).first()
            if db_med:
                db_med.is_available = med_item.is_available
                db_med.price = med_item.price if med_item.is_available else 0.0

                # DEDUCTION LOGIC: Only when confirming handover to patient
                if data.status == "Pending-Billing" and db_med.is_available:
                    catalog_item = db.query(MedicineCatalog).filter(
                        MedicineCatalog.name == db_med.medicine_name
                    ).first()
                    
                    if catalog_item:
                        # Deduct the prescribed dose from master stock
                        catalog_item.stock_quantity -= db_med.quantity

        appt.status = data.status
        db.commit()

        return {"status": "success", "message": f"Inventory updated and status changed to {data.status}"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# 3. FINAL BILL GENERATION (Updated for Qty Math)
@router.get("/final-bill/{appt_id}")
async def get_bill_details(appt_id: int, db: Session = Depends(get_db)):
    appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
    if not appt:
         raise HTTPException(status_code=404, detail="Appointment not found")

    consultation_fee = 500.0 
    prescriptions = db.query(Prescription).join(MedicalRecord).filter(
        MedicalRecord.appointment_id == appt_id,
        Prescription.is_available == True
    ).all()
    
    labs = db.query(LabRequest).filter(LabRequest.appointment_id == appt_id).all()

    # MATH: (Price * Quantity)
    total_meds = sum((p.price * p.quantity) for p in prescriptions)
    total_labs = sum(l.price_at_request for l in labs if l.price_at_request)

    return {
        "patient_name": f"{appt.patient.first_name} {appt.patient.last_name}",
        "consultation_fee": consultation_fee,
        "medicines": [
            {
                "name": p.medicine_name, 
                "price": p.price, 
                "qty": p.quantity, 
                "subtotal": p.price * p.quantity
            } for p in prescriptions
        ],
        "total_amount": consultation_fee + total_meds + total_labs
    }
# 4. GET PENDING FOR BILLING (Used by Receptionist)
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

# 4. FINAL BILL GENERATION
@router.get("/final-bill/{appt_id}")
async def get_bill_details(appt_id: int, db: Session = Depends(get_db)):
    appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
    if not appt:
         raise HTTPException(status_code=404, detail="Appointment not found")

    consultation_fee = 500.0 

    prescriptions = db.query(Prescription).join(MedicalRecord).filter(
        MedicalRecord.appointment_id == appt_id,
        Prescription.is_available == True
    ).all()
    
    labs = db.query(LabRequest).filter(LabRequest.appointment_id == appt_id).all()

    total_meds = sum(p.price for p in prescriptions)
    total_labs = sum(l.price_at_request for l in labs if l.price_at_request)

    return {
        "patient_name": f"{appt.patient.first_name} {appt.patient.last_name}",
        "doctor_name": appt.doctor_name if hasattr(appt, 'doctor_name') else "Doctor",
        "consultation_fee": consultation_fee,
        "medicines": [{"name": p.medicine_name, "price": p.price} for p in prescriptions],
        "labs": [{"test": l.test_name, "price": l.price_at_request} for l in labs],
        "total_amount": consultation_fee + total_meds + total_labs
    }