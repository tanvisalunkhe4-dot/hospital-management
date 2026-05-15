from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date, timedelta
from pydantic import BaseModel

# Project imports
from app.db.session import get_db
from app.db.models import Appointment, Prescription, Patient, MedicalRecord, LabRequest, MedicineCatalog

router = APIRouter(prefix="/api/v1/pharmacy", tags=["Pharmacy"])

# --- Schemas ---
class MedicineCreate(BaseModel):
    name: str
    stock_quantity: int
    min_reserve_limit: int
    price: float
    expiry_date: Optional[date] = None

    class Config:
        from_attributes = True

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
                if (available_stock - p.quantity) < catalog_item.min_reserve_limit:
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
            if not db_med:
                continue

            # 1. Fetch the catalog item immediately for every item
            catalog_item = db.query(MedicineCatalog).filter(
                MedicineCatalog.name == db_med.medicine_name
            ).first()

            # 2. THE HARD STOP: Run this check whenever 'is_available' is True
            if med_item.is_available and catalog_item:
                projected_stock = catalog_item.stock_quantity - db_med.quantity
                
                # If the pharmacist tries to mark it 'Available' but it's reserved
                if projected_stock < catalog_item.min_reserve_limit:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Action Denied: {db_med.medicine_name} is reserved for emergencies (Stock: {catalog_item.stock_quantity}, Reserve: {catalog_item.min_reserve_limit})."
                    )

            # 3. Update the prescription record
            db_med.is_available = med_item.is_available
            # Force price to 0 if unavailable, otherwise use the provided price
            db_med.price = med_item.price if med_item.is_available else 0.0

            # 4. STOCK DEDUCTION: Only happens when finally moving to Billing
            if data.status == "Pending-Billing" and db_med.is_available and catalog_item:
                catalog_item.stock_quantity -= db_med.quantity

        # 5. Commit changes
        appt.status = data.status
        db.commit()
        return {"status": "success", "message": f"Verified and moved to {data.status}"}

    except HTTPException as he:
        db.rollback()
        raise he
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

@router.post("/inventory/{hospital_id}")
async def add_to_inventory(hospital_id: int, medicine: MedicineCreate, db: Session = Depends(get_db)):
    try:
        new_medicine = MedicineCatalog(
            hospital_id=hospital_id,
            name=medicine.name,
            stock_quantity=medicine.stock_quantity,
            min_reserve_limit=medicine.min_reserve_limit,
            price=medicine.price,
            expiry_date=medicine.expiry_date
        )
        db.add(new_medicine)
        db.commit()
        db.refresh(new_medicine)
        return {"status": "success", "message": f"{medicine.name} added to inventory"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/inventory-alerts/{hospital_id}")
async def get_inventory_alerts(hospital_id: int, db: Session = Depends(get_db)):
    # 1. Low Stock Alerts (Stock <= Reserve Limit)
    low_stock = db.query(MedicineCatalog).filter(
        MedicineCatalog.stock_quantity <= MedicineCatalog.min_reserve_limit
    ).all()

    # 2. Expiry Alerts (Expiring in the next 30 days)
    # Note: Requires the expiry_date column added above
    thirty_days_from_now = datetime.now().date() + timedelta(days=30)
    expiring_soon = db.query(MedicineCatalog).filter(
        MedicineCatalog.expiry_date <= thirty_days_from_now
    ).all()

    return {
        "low_stock": [
            {
                "name": m.name,
                "current_stock": m.stock_quantity,
                "reserve_limit": m.min_reserve_limit,
                "status": "Critical" if m.stock_quantity == 0 else "Low"
            } for m in low_stock
        ],
        "expiring_soon": [
            {
                "name": m.name,
                "expiry_date": m.expiry_date.strftime("%Y-%m-%d"),
                "days_left": (m.expiry_date - datetime.now().date()).days
            } for m in expiring_soon
        ]
    }
@router.get("/inventory-stats/{hospital_id}")
async def get_inventory_stats(hospital_id: int, db: Session = Depends(get_db)):
    # 1. Total count of ALL medicine types in your Kaggle/Active catalog
    total_catalog = db.query(MedicineCatalog).filter(
        MedicineCatalog.hospital_id == hospital_id
    ).count()
    
    # 2. Count only those that have triggered an alert (Stock <= Reserve)
    critical_alerts = db.query(MedicineCatalog).filter(
        MedicineCatalog.hospital_id == hospital_id,
        MedicineCatalog.stock_quantity <= MedicineCatalog.min_reserve_limit
    ).count()

    return {
        "total_medicines": total_catalog,
        "low_stock_alerts": critical_alerts
    }