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

# 1. GET PENDING FOR PHARMACY (Queue for Pricing & Dispensing)
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

        pres_list = []
        for p in prescriptions:
            catalog_item = db.query(MedicineCatalog).filter(
                MedicineCatalog.name == p.medicine_name
            ).first()

            is_out_of_stock = False
            available_stock = 0
            
            if catalog_item:
                available_stock = catalog_item.stock_quantity
                if available_stock < p.quantity:
                    is_out_of_stock = True
            else:
                is_out_of_stock = True

            pres_list.append({
                "id": p.id,
                "medicine_name": p.medicine_name, 
                "dosage": p.dosage, 
                "frequency": p.frequency,
                "quantity": p.quantity,
                "instructions": p.instructions,
                "is_available": p.is_available,
                "price": p.price,
                "is_out_of_stock": is_out_of_stock,
                "current_inventory": available_stock
            })

        response.append({
            "appt_id": a.id,
            "patient_id": a.patient_id,
            "patient_name": f"{a.patient.first_name} {a.patient.last_name}",
            "doctor_name": a.doctor_name if hasattr(a, 'doctor_name') else "N/A",
            "time": a.created_at.strftime("%H:%M") if a.created_at else "N/A",
            "prescriptions": pres_list
        })
    
    return response

# 2. UPDATE STATUS & DEDUCT STOCK (Confirm Pricing or Confirm Handover)
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
                # If med is unavailable, price MUST be 0.0
                db_med.price = med_item.price if med_item.is_available else 0.0

                # Actual Stock Deduction happens when moving to 'Pending-Billing'
                if data.status == "Pending-Billing" and db_med.is_available:
                    catalog_item = db.query(MedicineCatalog).filter(
                        MedicineCatalog.name == db_med.medicine_name
                    ).first()
                    
                    if catalog_item:
                        catalog_item.stock_quantity -= db_med.quantity

        appt.status = data.status
        db.commit()
        return {"status": "success", "message": f"Updated to {data.status}"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# 3. GET BILLING QUEUE (For Receptionist Overview)
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

# 4. FINAL BILL GENERATION (The "Source of Truth" for Invoice)
@router.get("/final-bill/{appt_id}")
async def get_bill_details(appt_id: int, db: Session = Depends(get_db)):
    appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
    if not appt:
         raise HTTPException(status_code=404, detail="Appointment not found")

    consultation_fee = 500.0 
    
    # We fetch ALL prescriptions linked to this appointment
    prescriptions = db.query(Prescription).join(MedicalRecord).filter(
        MedicalRecord.appointment_id == appt_id
    ).all()
    
    labs = db.query(LabRequest).filter(LabRequest.appointment_id == appt_id).all()

    # MATH: Only sum up medications that were marked as AVAILABLE
    total_meds = sum((p.price * p.quantity) for p in prescriptions if p.is_available)
    total_labs = sum(l.price_at_request for l in labs if l.price_at_request)

    return {
        "patient_id": appt.patient_id,
        "patient_name": f"{appt.patient.first_name} {appt.patient.last_name}",
        "doctor_name": appt.doctor_name if hasattr(appt, 'doctor_name') else "Doctor",
        "consultation_fee": consultation_fee,
        "medicines": [
            {
                "name": p.medicine_name, 
                "unit_price": p.price, 
                "qty": p.quantity, 
                "subtotal": p.price * p.quantity, # Correct multiplication for tablets/syrups
                "is_available": p.is_available     # Tells UI to show "Out of Stock" if False
            } for p in prescriptions
        ],
        "labs": [
            {
                "test": l.test_name, 
                "price": l.price_at_request
            } for l in labs
        ],
        "total_amount": consultation_fee + total_meds + total_labs
    }