from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date, timedelta
from pydantic import BaseModel

# Project imports
from app.db.session import get_db
from app.db.models import Appointment, Prescription, Patient, MedicalRecord, LabRequest, MedicineCatalog, Supplier, PurchaseOrder

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

class SupplierCreate(BaseModel):
    name: str
    contact_person: Optional[str] = ""
    phone: Optional[str] = ""
    email: Optional[str] = ""
    address: Optional[str] = ""

class PurchaseCreate(BaseModel):
    supplier_id: int
    medicine_name: str
    quantity_ordered: int
    unit_cost: float
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
                MedicineCatalog.name == p.medicine_name,
                MedicineCatalog.hospital_id == hospital_id
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
                MedicineCatalog.name == db_med.medicine_name,
                MedicineCatalog.hospital_id == appt.hospital_id
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

# --- ADD THIS NEW ENDPOINT FOR SEARCH SUGGESTIONS ---
@router.get("/search-master")
async def search_master_catalog(q: str, db: Session = Depends(get_db)):
    """Searches the global Kaggle database (where hospital_id is NULL) as the pharmacist types."""
    if not q or len(q) < 3:
        return []
    
    results = db.query(MedicineCatalog).filter(
        MedicineCatalog.hospital_id == None,
        MedicineCatalog.name.ilike(f"%{q}%")
    ).limit(10).all()
    
    return [{"id": m.id, "name": m.name, "manufacturer": m.manufacturer, "category": m.category} for m in results]


@router.post("/inventory/{hospital_id}")
async def add_to_inventory(hospital_id: int, medicine: MedicineCreate, db: Session = Depends(get_db)):
    try:
        # Step 1: Check if this medicine is already assigned to your specific hospital
        local_item = db.query(MedicineCatalog).filter(
            MedicineCatalog.name == medicine.name,
            MedicineCatalog.hospital_id == hospital_id
        ).first()
        
        if local_item:
            # If it already exists locally, simply update the stock and parameters (No Duplicates)
            local_item.stock_quantity += medicine.stock_quantity
            local_item.min_reserve_limit = medicine.min_reserve_limit
            local_item.price = medicine.price
            if medicine.expiry_date:
                local_item.expiry_date = medicine.expiry_date
            db.commit()
            return {"status": "success", "message": f"Updated stock for existing inventory item: {medicine.name}"}

        # Step 2: If it's a first-time activation, fetch the structural template (Kaggle dataset reference row)
        global_item = db.query(MedicineCatalog).filter(
            MedicineCatalog.name == medicine.name,
            MedicineCatalog.hospital_id == None
        ).first()

        # Step 3: CLONE instead of modify. Create a brand new dedicated tracking row for this hospital branch
        new_medicine = MedicineCatalog(
            hospital_id=hospital_id,          # Explicitly isolate to this hospital context
            name=medicine.name,
            stock_quantity=medicine.stock_quantity,
            min_reserve_limit=medicine.min_reserve_limit,
            price=medicine.price,
            expiry_date=medicine.expiry_date,
            
            # Inherit catalog attributes dynamically from master reference template if found
            salt_composition=global_item.salt_composition if global_item else None,
            strength=global_item.strength if global_item else None,
            category=global_item.category if global_item else "General",
            manufacturer=global_item.manufacturer if global_item else "Unknown Lab"
        )
        db.add(new_medicine)
        db.commit()
        return {"status": "success", "message": f"Successfully activated tracking row for {medicine.name}"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/inventory-alerts/{hospital_id}")
async def get_inventory_alerts(hospital_id: int, db: Session = Depends(get_db)):
    # 1. Low Stock Alerts: Genuinely checks across ALL medicines belonging to this hospital ID
    low_stock = db.query(MedicineCatalog).filter(
        MedicineCatalog.hospital_id == hospital_id, # <-- Strictly targets your hospital's stock row
        MedicineCatalog.stock_quantity <= MedicineCatalog.min_reserve_limit
    ).order_by(MedicineCatalog.stock_quantity.asc()).limit(100).all()

    # 2. Expiry Alerts: Strictly restricted to this hospital ID
    thirty_days_from_now = datetime.now().date() + timedelta(days=30)
    expiring_soon = db.query(MedicineCatalog).filter(
        MedicineCatalog.hospital_id == hospital_id, # <-- Keeps data isolated
        MedicineCatalog.expiry_date <= thirty_days_from_now
    ).limit(50).all()

    return {
        "low_stock": [
            {
                "name": m.name,
                "current_stock": m.stock_quantity,
                "reserve_limit": m.min_reserve_limit,
                "price": m.price, # <-- ADDED: Passes pricing context to frontend edit modal
                "expiry_date": m.expiry_date.strftime("%Y-%m-%d") if m.expiry_date else "",
                "status": "Critical" if m.stock_quantity == 0 else "Low"
            } for m in low_stock
        ],
        "expiring_soon": [
            {
                "name": m.name,
                "expiry_date": m.expiry_date.strftime("%Y-%m-%d") if m.expiry_date else "N/A",
                "days_left": (m.expiry_date - datetime.now().date()).days if m.expiry_date else 0
            } for m in expiring_soon
        ]
    }

@router.get("/inventory-stats/{hospital_id}")
async def get_inventory_stats(hospital_id: int, db: Session = Depends(get_db)):
    # Total unique medicines activated for this specific hospital unit
    total_catalog = db.query(MedicineCatalog).filter(
        MedicineCatalog.hospital_id == hospital_id
    ).count()
    
    # Real-time alert counts exclusively calculated for this hospital
    critical_alerts = db.query(MedicineCatalog).filter(
        MedicineCatalog.hospital_id == hospital_id, # <-- Isolates calculation targets
        MedicineCatalog.stock_quantity <= MedicineCatalog.min_reserve_limit
    ).count()

    return {
        "total_medicines": total_catalog,
        "low_stock_alerts": critical_alerts
    }

# A. Add a new supplier vendor
@router.post("/suppliers/{hospital_id}")
async def add_supplier(hospital_id: int, payload: SupplierCreate, db: Session = Depends(get_db)):
    db_supplier = Supplier(
        hospital_id=hospital_id,
        name=payload.name,
        contact_person=payload.contact_person,
        phone=payload.phone,
        email=payload.email,
        address=payload.address
    )
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return {"message": "Supplier registered successfully", "supplier_id": db_supplier.id}

# B. Get all suppliers for the current hospital unit
@router.get("/suppliers/{hospital_id}")
async def get_suppliers(hospital_id: int, db: Session = Depends(get_db)):
    return db.query(Supplier).filter(Supplier.hospital_id == hospital_id).all()

# C. Record a Purchase Order (And increment inventory stock automatically!)
@router.post("/purchase/{hospital_id}")
async def record_purchase(hospital_id: int, payload: PurchaseCreate, db: Session = Depends(get_db)):
    # 1. Calculate total cost transaction
    total = payload.quantity_ordered * payload.unit_cost
    
    # 2. Log purchase history entry
    order = PurchaseOrder(
        hospital_id=hospital_id,
        supplier_id=payload.supplier_id,
        medicine_name=payload.medicine_name,
        quantity_ordered=payload.quantity_ordered,
        unit_cost=payload.unit_cost,
        total_amount=total,
        purchase_date=datetime.utcnow().date()
    )
    db.add(order)
    
    # 3. CRITICAL LOOP: Find the medication row inside this hospital and add the incoming stock
    catalog_item = db.query(MedicineCatalog).filter(
        MedicineCatalog.hospital_id == hospital_id,
        MedicineCatalog.name.ilike(payload.medicine_name)
    ).first()
    
    if catalog_item:
        catalog_item.stock_quantity += payload.quantity_ordered
        catalog_item.price = payload.unit_cost * 1.25
    else:
        # If medicine doesn't exist yet, register it as a fresh record automatically
        new_item = MedicineCatalog(
            hospital_id=hospital_id,
            name=payload.medicine_name,
            stock_quantity=payload.quantity_ordered,
            min_reserve_limit=10, # default safety fallback margin
            price=payload.unit_cost * 1.25 # markup automatically for patient pricing retail
        )
        db.add(new_item)
        
    db.commit()
    return {"message": "Purchase completed successfully. Inventory stock replenished!"}

# D. Fetch running transaction purchase history statement ledger
@router.get("/purchase-history/{hospital_id}")
async def get_purchase_history(hospital_id: int, db: Session = Depends(get_db)):
    results = db.query(
        PurchaseOrder.id,
        PurchaseOrder.medicine_name,
        PurchaseOrder.quantity_ordered,
        PurchaseOrder.unit_cost,
        PurchaseOrder.total_amount,
        PurchaseOrder.purchase_date,
        Supplier.name.label("supplier_name")
    ).join(Supplier, PurchaseOrder.supplier_id == Supplier.id)\
     .filter(PurchaseOrder.hospital_id == hospital_id)\
     .order_by(PurchaseOrder.id.desc()).all()
     
    return [dict(r._mapping) for r in results]

@router.get("/overview-metrics/{hospital_id}")
async def get_overview_metrics(hospital_id: int, db: Session = Depends(get_db)):
    # 1. Count pending prescriptions waiting for verification
    pending_count = db.query(Appointment).filter(
        Appointment.hospital_id == hospital_id,
        Appointment.status == "Pending-Pharmacy"
    ).count()

    # 2. Count items ready for handover dispensing
    ready_count = db.query(Appointment).filter(
        Appointment.hospital_id == hospital_id,
        Appointment.status == "Ready-to-Dispense"
    ).count()

    # 3. Count low stock items (where stock is less than or equal to reserve safety limit)
    low_stock = db.query(MedicineCatalog).filter(
        MedicineCatalog.hospital_id == hospital_id,
        MedicineCatalog.stock_quantity <= MedicineCatalog.min_reserve_limit,
        MedicineCatalog.stock_quantity > 0
    ).count()

    # 4. Count out-of-stock critical rows
    out_of_stock = db.query(MedicineCatalog).filter(
        MedicineCatalog.hospital_id == hospital_id,
        MedicineCatalog.stock_quantity == 0
    ).count()

    # 5. Count total registered supply partners
    # Note: If you haven't imported the Supplier model here yet, ensure it's imported at the top!
    total_suppliers = db.query(Supplier).filter(Supplier.hospital_id == hospital_id).count()

    return {
        "pending_verify": pending_count,
        "ready_to_dispense": ready_count,
        "low_stock_count": low_stock,
        "out_of_stock_count": out_of_stock,
        "total_suppliers": total_suppliers
    }