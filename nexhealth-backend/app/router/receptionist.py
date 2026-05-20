from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db import models
from app.schemas import patient_schema, appointment_schema, invoice_schema
from app.schemas.appointment_schema import FinalizeSchema, RescheduleRequestSchema
from app.schemas.patient_schema import PatientUpdate, PatientCreate, PatientResponse
from app.db.session import get_db
from passlib.context import CryptContext
import logging
import datetime 
from typing import List
from sqlalchemy import desc
from app.constants import STATUS_SCHEDULED, STATUS_CHECKED_IN, STATUS_IN_CONSULTATION, STATUS_COMPLETED
from app.status import normalize_appointment_status
# Setup for logging and database operations
router = APIRouter(prefix="/api/v1/receptionist", tags=["receptionist"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
logger = logging.getLogger(__name__)


# --- PATIENT REGISTRATION ---
@router.post("/register-patient", response_model=patient_schema.PatientResponse, status_code=status.HTTP_201_CREATED)
def register_patient(patient_in: patient_schema.PatientCreate, db: Session = Depends(get_db)):
    # 1. Check if the patient already exists in the Patient table (by phone)
    existing_patient = db.query(models.Patient).filter(
        models.Patient.phone_number == patient_in.phone_number
    ).first()
    
    if existing_patient:
        logger.warning(f"Registration failed: Phone {patient_in.phone_number} already exists.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A patient with this phone number already exists."
        )

    try:
        processed_abha_id = patient_in.abha_id.strip() if patient_in.abha_id and patient_in.abha_id.strip() != "" else None

        # --- UPDATED LOGIC ---
        # We use **patient_in.dict() to catch ALL fields (including email) automatically
        patient_data = patient_in.dict(exclude_unset=True)
        
        # Override specific logic fields
        patient_data.update({
            "user_id": None, 
            "abha_id": processed_abha_id,
            "status": "Registered"
        })

        new_patient = models.Patient(**patient_data)
        
        db.add(new_patient)
        db.commit()
        db.refresh(new_patient)
        
        logger.info(f"Successfully registered medical record for: {patient_in.first_name}")
        return new_patient

    except Exception as e:
        db.rollback() 
        logger.error(f"DATABASE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error during registration.")
# --- APPOINTMENT BOOKING ---

@router.post("/book-appointment", response_model=appointment_schema.AppointmentResponse)
def book_appointment(appt_in: appointment_schema.AppointmentCreate, hosp_id: int, db: Session = Depends(get_db)):
    # 1. Verify Patient exists
    patient = db.query(models.Patient).filter(
        models.Patient.id == appt_in.patient_id,
        models.Patient.hospital_id == hosp_id
    ).first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient record not found.")

        print(f"DEBUG: Received doctor_id: {appt_in.doctor_id} for Patient: {appt_in.patient_id}")

    # 1.5 Verify the doctor is active (soft-delete aware)
    doctor = db.query(models.Staff).filter(
        models.Staff.id == appt_in.doctor_id,
        models.Staff.hospital_id == hosp_id,
        models.Staff.is_active == True
    ).first()
    if not doctor:
        raise HTTPException(status_code=400, detail="Selected doctor is not available (inactive or invalid).")



   
    try:
        # 2. Create the appointment 
        # Note: Ensure 'doctor_name' exists in your models.Appointment. 
        # If it still fails, check models.py for the correct field name.
        new_appt = models.Appointment(
            patient_id=appt_in.patient_id,
            hospital_id=hosp_id,
            doctor_id=appt_in.doctor_id,
            doctor_name=appt_in.doctor_name,
            appointment_date=appt_in.appointment_date,
            appointment_time=appt_in.appointment_time,
            reason=appt_in.reason,
            status="Scheduled"
        )
        db.add(new_appt)
        db.commit()
        db.refresh(new_appt)
        return new_appt
    except Exception as e:
        db.rollback()
        print(f"DEBUG ERROR: {str(e)}") # This will show in your terminal
        raise HTTPException(status_code=500, detail="Database Error: Check if doctor_name column exists.")
# --- DASHBOARD & UTILITIES ---

@router.get("/stats/{hosp_id}")
async def get_dashboard_stats(hosp_id: int, db: Session = Depends(get_db)):
    """
    Fetches real-time statistics for the receptionist dashboard, 
    including patient counts, today's appointments, and live queue status.
    """
    today = datetime.date.today()
    
    # 1. Total registered patients in this hospital
    patient_count = db.query(models.Patient).filter(
        models.Patient.hospital_id == hosp_id
    ).count()
    
    # 2. All valid appointments scheduled for today
    appt_count = db.query(models.Appointment).filter(
        models.Appointment.hospital_id == hosp_id,
        models.Appointment.appointment_date == today,
        models.Appointment.status != "Cancelled"
    ).count()

    # 3. Live Consultations: Only those actively in the building (Checked In or currently with Doctor)
    # This specifically uses the constants defined above to avoid NameErrors.
    live_queue = db.query(models.Appointment).filter(
        models.Appointment.hospital_id == hosp_id,
        models.Appointment.appointment_date == today,
        models.Appointment.status.in_([STATUS_CHECKED_IN, STATUS_IN_CONSULTATION])
    ).count()

    # 4. Financial Summary: Total paid invoices
    total_collections = db.query(func.sum(models.Invoice.total_amount)).filter(
        models.Invoice.hospital_id == hosp_id,
        models.Invoice.status == "Paid"
    ).scalar() or 0

    # 5. Financial Summary: Count of pending payments
    unpaid_count = db.query(models.Invoice).filter(
        models.Invoice.hospital_id == hosp_id,
        models.Invoice.status == "Pending"
    ).count()

    return {
        "total_patients": patient_count,
        "appointments_today": appt_count,
        "total_collections": float(total_collections), # Ensure JSON compatibility
        "pending_bills": unpaid_count,
        "consultations": live_queue 
    }

@router.get("/patients/search", response_model=list[patient_schema.PatientResponse])
def search_patients(query: str, hosp_id: int, db: Session = Depends(get_db)):
    # .all() is critical here to return a LIST of objects
    results = db.query(models.Patient).filter(
        models.Patient.hospital_id == hosp_id,
        (models.Patient.first_name.ilike(f"%{query}%")) | 
        (models.Patient.phone_number.contains(query))
    ).all()
    return results

@router.get("/patients/recent", response_model=list[patient_schema.PatientResponse])
def get_recent_patients(hosp_id: int, db: Session = Depends(get_db)):
    return db.query(models.Patient).filter(
        models.Patient.hospital_id == hosp_id
    ).order_by(models.Patient.id.desc()).limit(5).all()

# --- DASHBOARD & UTILITIES (Updated Section) ---

@router.get("/appointments/today")
def get_todays_appointments(hosp_id: int, db: Session = Depends(get_db)):
    today = datetime.date.today()
    
    # We join Appointment and Patient to get the name
    results = db.query(models.Appointment, models.Patient).join(
        models.Patient, models.Appointment.patient_id == models.Patient.id
    ).filter(
        models.Appointment.hospital_id == hosp_id,
        models.Appointment.appointment_date == today
    ).order_by(models.Appointment.appointment_time.asc()).all()

    return [
        {
            **appt.__dict__, 
            "patient_name": f"{patient.first_name} {patient.last_name}"
        } for appt, patient in results
    ]

@router.get("/appointments/upcoming")
def get_upcoming_appointments(hosp_id: int, db: Session = Depends(get_db)):
    today = datetime.date.today()
    next_week = today + datetime.timedelta(days=7)
    
    results = db.query(models.Appointment, models.Patient).join(
        models.Patient, models.Appointment.patient_id == models.Patient.id
    ).filter(
        models.Appointment.hospital_id == hosp_id,
        models.Appointment.appointment_date > today,
        models.Appointment.appointment_date <= next_week
    ).order_by(models.Appointment.appointment_date.asc()).all()

    return [
        {
            **appt.__dict__, 
            "patient_name": f"{patient.first_name} {patient.last_name}"
        } for appt, patient in results
    ]
    
@router.get("/patients/all", response_model=List[patient_schema.PatientResponse])
def get_all_patients(hosp_id: int, db: Session = Depends(get_db)):
    return db.query(models.Patient).filter(models.Patient.hospital_id == hosp_id).all()

# --- APPOINTMENT ACTIONS ---

@router.patch("/appointments/{appt_id}", response_model=appointment_schema.AppointmentResponse)
def update_appointment(appt_id: int, hosp_id: int, appt_update: appointment_schema.AppointmentUpdate, db: Session = Depends(get_db)):
    appt = db.query(models.Appointment).filter(models.Appointment.id == appt_id, models.Appointment.hospital_id == hosp_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    update_data = appt_update.model_dump(exclude_unset=True)
    try:
        for key, value in update_data.items():
            setattr(appt, key, value)
        db.commit()
        db.refresh(appt)
        return appt
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Update failed.")

@router.patch("/appointments/{appt_id}/status")
def update_appointment_status(appt_id: int, hosp_id: int, status_update: dict, db: Session = Depends(get_db)):
    appt = db.query(models.Appointment).filter(models.Appointment.id == appt_id, models.Appointment.hospital_id == hosp_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    appt.status = normalize_appointment_status(status_update.get("status", appt.status)) or appt.status
    db.commit()
    return {"message": "Status updated", "status": appt.status}

@router.delete("/appointments/{appt_id}")
def delete_appointment(appt_id: int, hosp_id: int, db: Session = Depends(get_db)):
    appt = db.query(models.Appointment).filter(models.Appointment.id == appt_id, models.Appointment.hospital_id == hosp_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    db.delete(appt)
    db.commit()
    return {"message": "Deleted successfully"}

@router.patch("/appointments/{appt_id}/check-in")
def check_in_appointment(appt_id: int, hosp_id: int, db: Session = Depends(get_db)):
    """Moves patient from Scheduled to the Doctor's Live Queue."""
    appt = db.query(models.Appointment).filter(
        models.Appointment.id == appt_id, 
        models.Appointment.hospital_id == hosp_id
    ).first()

    if not appt:
        raise HTTPException(status_code=404, detail="Appointment record not found.")

    if appt.status in [STATUS_IN_CONSULTATION, "Completed"]:
        raise HTTPException(status_code=400, detail=f"Cannot check-in. Patient is already {appt.status}.")

    try:
        appt.status = STATUS_CHECKED_IN  # Synchronized with doctor_10.py
        db.commit()
        db.refresh(appt)
        return {"message": "Patient checked in successfully", "status": appt.status}
    except Exception as e:
        db.rollback()
        logger.error(f"CHECK-IN ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update check-in status.")
@router.patch("/appointments/{appt_id}/reschedule")

def reschedule_appointment(
    appt_id: int, 
    hosp_id: int, 
    payload: dict, 
    db: Session = Depends(get_db)
):
    """
    Globally handles rescheduling for any appointment.
    Moves the patient back to 'Scheduled' status so it works for 
    both upcoming and already checked-in patients.
    """
    appt = db.query(models.Appointment).filter(
        models.Appointment.id == appt_id, 
        models.Appointment.hospital_id == hosp_id
    ).first()

    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    try:
        # Update with the new date/time from the frontend modal
        appt.appointment_date = payload.get("appointment_date", appt.appointment_date)
        appt.appointment_time = payload.get("appointment_time", appt.appointment_time)
        
        # Reset status to Scheduled so they leave the Waiting Room 
        # and appear in the regular schedule for the new time
        appt.status = "Scheduled" 
        
        db.commit()
        db.refresh(appt)
        return {"message": "Rescheduled successfully", "new_time": appt.appointment_time}
    except Exception as e:
        db.rollback()
        logger.error(f"RESCHEDULE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to reschedule appointment.")

        
# --- INVOICE & BILLING ACTIONS ---

@router.post("/invoices/generate", response_model=invoice_schema.InvoiceResponse)
def generate_invoice(invoice_in: invoice_schema.InvoiceCreate, db: Session = Depends(get_db)):
    try:
        # 1. Verify Patient
        patient = db.query(models.Patient).filter(models.Patient.id == invoice_in.patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")

        # 2. Numbering Logic
        last_invoice = db.query(models.Invoice).order_by(models.Invoice.id.desc()).first()
        next_id = (last_invoice.id + 1) if last_invoice else 1
        inv_number = f"INV-{datetime.date.today().year}-{next_id:04d}"

        # 3. Calculation Logic
        subtotal = sum(item.unit_price * (item.quantity or 1) for item in invoice_in.items)
        # Apply tax and discount to the total_amount directly
        final_total = (subtotal * (1 + (invoice_in.tax_rate or 0.05))) - (invoice_in.discount or 0)

        # 4. Create Main Invoice
        new_invoice = models.Invoice(
            invoice_number=inv_number,
            patient_id=invoice_in.patient_id,
            hospital_id=invoice_in.hospital_id,
            total_amount=final_total,
            status="Pending"
        )
        db.add(new_invoice)
        db.flush() 

        # 5. Create Invoice Items
        for item in invoice_in.items:
            db_item = models.InvoiceItem(
                invoice_id=new_invoice.id,
                service_name=item.service_name,
                unit_price=item.unit_price,
                subtotal=item.unit_price * (item.quantity or 1)
            )
            db.add(db_item)

        # 6. Queue Cleanup (Synchronized across clinical modules)
        appt_id = getattr(invoice_in, 'appointment_id', None)
        if appt_id:
            # Update Appointment status to remove from front-desk billing workflows
            db.query(models.Appointment).filter(
                models.Appointment.id == appt_id
            ).update({"status": "Completed"}, synchronize_session=False)
            
            # Update Lab Requests state to Billed
            db.query(models.LabRequest).filter(
                models.LabRequest.appointment_id == appt_id
            ).update({"status": "Billed"}, synchronize_session=False)

            # UPDATED: Clear associated prescriptions out of pharmacy queues
            # Uses subquery check to capture matching Medical Records linked to this appointment id
            medical_record_ids = db.query(models.MedicalRecord.id).filter(
                models.MedicalRecord.appointment_id == appt_id
            ).subquery()

            db.query(models.Prescription).filter(
                models.Prescription.record_id.in_(medical_record_ids)
            ).update({"status": "Billed"}, synchronize_session=False)

        db.commit()
        db.refresh(new_invoice)

        return {
            "id": new_invoice.id,
            "invoice_number": new_invoice.invoice_number,
            "patient_id": new_invoice.patient_id,
            "patient_name": f"{patient.first_name} {patient.last_name}",
            "hospital_id": new_invoice.hospital_id,
            "total_amount": new_invoice.total_amount,
            "status": new_invoice.status,
            "created_at": new_invoice.created_at,
            "items": new_invoice.items 
        }

    except Exception as e:
        db.rollback()
        print(f"INVOICE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@router.get("/invoices/all", response_model=List[invoice_schema.InvoiceResponse])
def get_all_invoices(hosp_id: int, db: Session = Depends(get_db)):
    results = db.query(
        models.Invoice.id,
        models.Invoice.invoice_number,
        models.Invoice.patient_id,
        (models.Patient.first_name + " " + models.Patient.last_name).label("patient_name"),
        models.Invoice.total_amount,
        models.Invoice.status,
        models.Invoice.created_at,
        models.Invoice.hospital_id
    ).join(
        models.Patient, 
        models.Invoice.patient_id == models.Patient.id
    ).filter(
        models.Invoice.hospital_id == hosp_id
    ).order_by(
        desc(models.Invoice.created_at)
    ).all()

    return results

@router.patch("/invoices/{invoice_id}/pay")
def mark_invoice_as_paid(invoice_id: int, hosp_id: int, db: Session = Depends(get_db)):
    invoice = db.query(models.Invoice).filter(
        models.Invoice.id == invoice_id, 
        models.Invoice.hospital_id == hosp_id
    ).first()

    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    try:
        invoice.status = "Paid"
        db.commit()
        db.refresh(invoice)
        return {"message": "Payment successful", "status": invoice.status}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Payment processing failed.")

@router.patch("/patients/{patient_id}", response_model=PatientResponse)
def update_patient_profile(
    patient_id: int,
    patient_in: PatientUpdate,
    hosp_id: int,
    db: Session = Depends(get_db)
):
    # 1. Fetch the patient record
    patient_record = db.query(models.Patient).filter(
        models.Patient.id == patient_id, 
        models.Patient.hospital_id == hosp_id
    ).first()
    
    if not patient_record:
        raise HTTPException(status_code=404, detail="Patient not found")

    # 2. Update fields dynamically
    update_data = patient_in.model_dump(exclude_unset=True)
    
    try:
        for field, value in update_data.items():
            if hasattr(patient_record, field):
                # Handle Date Conversion for SQL
                if field == "date_of_birth" and isinstance(value, str) and value:
                    value = datetime.strptime(value, "%Y-%m-%d")
                
                # Special handling for ABHA ID to clear empty strings
                if field == "abha_id" and (value == "" or value is None):
                    value = None
                
                setattr(patient_record, field, value)
            
        # 3. Commit changes
        db.commit()
        db.refresh(patient_record)
        return patient_record

    except Exception as e:
        db.rollback()
        logger.error(f"UPDATE ERROR: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Database update failed: {str(e)}")

    # --- DOCTOR LOOKUP FOR APPOINTMENTS ---
@router.get("/doctors/{hosp_id}")
def get_available_doctors(hosp_id: int, db: Session = Depends(get_db)):
    """
    Fetches all staff members with the role 'Doctor' for a specific hospital.
    """
    doctors = db.query(models.Staff).filter(
        models.Staff.hospital_id == hosp_id,
        models.Staff.role.ilike("Doctor"),
        models.Staff.is_active == True
    ).all()
    
    if not doctors:
        return []
        
    return [
        {
            "id": doc.id,
            "staff_id": doc.staff_id,
            "full_name": doc.full_name,
            # If specialization doesn't exist, we use a fallback or remove it
            "specialization": getattr(doc, 'specialization', 'General Physician') 
        } for doc in doctors
    ]

# In app/router/receptionist.py

@router.patch("/appointments/{appt_id}/approve")
def approve_appointment_request(
    appt_id: int, 
    hosp_id: int, 
    db: Session = Depends(get_db)
):
    # 1. Fetch the appointment
    appt = db.query(models.Appointment).filter(
        models.Appointment.id == appt_id,
        models.Appointment.hospital_id == hosp_id
    ).first()

    if not appt:
        raise HTTPException(status_code=404, detail="Appointment request not found")

    # 2. Update status to Scheduled
    appt.status = "Scheduled"
    
    db.commit()
    db.refresh(appt)
    
    return {"message": "Appointment approved successfully", "status": appt.status}


@router.patch("/appointments/{appt_id}/finalize")
async def finalize_request(appt_id: int, action: FinalizeSchema, db: Session = Depends(get_db)):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appt_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if action.decision == "approve_cancel":
        appointment.status = "Cancelled"
    elif action.decision == "approve_reschedule":
        appointment.status = "Scheduled"
        # Update to the new time stored in notes
    
    db.commit()
    return {"message": f"Action {action.decision} successful"}

@router.patch("/appointments/{appt_id}/finish")
def finish_consultation(appt_id: int, hosp_id: int, db: Session = Depends(get_db)):
    """
    Called when the doctor is done. 
    1. Turns the status to 'Completed' (Blue).
    2. Generates a basic invoice for the Billing section.
    """
    appt = db.query(models.Appointment).filter(
        models.Appointment.id == appt_id, 
        models.Appointment.hospital_id == hosp_id
    ).first()

    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    try:
        # 1. Update the status
        appt.status = "Completed"
        
        
        db.commit()
        
        return {"message": "Consultation finished. Status is now Completed (Blue)."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to finish consultation.")


@router.get("/billing/queue/{hosp_id}")
def get_billing_queue(hosp_id: int, db: Session = Depends(get_db)):
    """
    Fetches patients eligible for front-desk checkout.
    Captures normal completions, pre-priced pharmacy entries, and bypass edge cases.
    """
    # Allowed statuses that can be pulled into the receptionist checkout queue
    allowed_statuses = ["Pending-Billing","Pending-Pharmacy", "Pending-Pharmacy", "Ready-to-Dispense"]

    results = db.query(models.Appointment, models.Patient).join(
        models.Patient, models.Appointment.patient_id == models.Patient.id
    ).filter(
        models.Appointment.hospital_id == hosp_id,
        models.Appointment.status.in_(allowed_statuses)
    ).all()

    return [
        {
            "id": appt.id,
            "patient_id": patient.id,
            "patient_name": f"{patient.first_name} {patient.last_name}",
            "status": appt.status, # Returns the actual stage to Billing.jsx for UI warning logic
            "appointment_date": appt.appointment_date,
            "invoice_number": "NEW", 
            "total_amount": 0 
        } for appt, patient in results
    ]

# receptionist.py

@router.get("/billing/prepare/{appt_id}")
def prepare_invoice(appt_id: int, skip_pharmacy: bool = False, db: Session = Depends(get_db)):
    appt = db.query(models.Appointment).filter(models.Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Start with standard consultation fee
    items = [{
        "service_name": "Consultation Fee", 
        "unit_price": 500.0, 
        "type": "Consultation"
    }]
    
    # Only pull and add pharmacy charges if the patient hasn't skipped internal fulfillment
    if not skip_pharmacy:
        prescriptions = db.query(models.Prescription).join(models.MedicalRecord).filter(
            models.Prescription.medical_record_id == medical_record.id,
            models.Prescription.is_available == True  # Crucial: Filter out pharmacist flagged out-of-stock items
        ).all()

        for p in prescriptions:
            items.append({
                "service_name": p.medicine_name,
                "unit_price": p.price if p.price else 0.0,
                "type": "Pharmacy",
                "quantity": p.quantity if hasattr(p, 'quantity') else 1
            })
            
    # Always pull laboratory requests regardless of pharmacy choice
    lab_requests = db.query(
        models.LabRequest, 
        models.LabTestCatalog.base_price
    ).outerjoin(
        models.LabTestCatalog, \
        models.LabRequest.test_name == models.LabTestCatalog.test_name
    ).filter(
        models.LabRequest.appointment_id == appt_id
    ).all()

    for request, catalog_price in lab_requests:
        final_price = request.price_at_request if request.price_at_request else catalog_price
        items.append({
            "service_name": request.test_name,
            "unit_price": final_price if final_price else 0.0,
            "type": "Laboratory" 
        })

    return {
        "appt_id": appt.id,
        "patient_id": appt.patient_id,
        "patient_name": f"{appt.patient.first_name} {appt.patient.last_name}",
        "items": items,
        "skip_pharmacy_applied": skip_pharmacy
    }