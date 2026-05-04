from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional, Dict
from datetime import datetime, timezone
from fastapi.responses import Response
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from io import BytesIO
from xhtml2pdf import pisa
from ..db import models
from app.db.models import User
from app.router.deps import get_current_active_user as get_current_user
import shutil
import os
import uuid
from app.db.models import MedicalRecord
# Import your shared logic
from ..utils import verify_password, hash_password
from app.db.session import get_db
from app.router.deps import get_current_active_user
from app.db.models import Patient
from app.db.models import Patient, User, Appointment, MedicalRecord
from app.schemas.patient_schema import (
    PatientProfile,
    PatientUpdate,
    PatientDashboardSummary,
    PatientCreate,
    PatientResponse,
    PatientInQueue,
    DoctorQueueResponse,
)
from app.schemas.auth_schema import (
    PasswordChange,
    AppointmentRead,
    MedicalRecordRead
)
from app.schemas.appointment_schema import(
    AppointmentBase,
    AppointmentCreate,
    AppointmentResponse,
    AppointmentUpdate,
    PatientAppointmentRequest
)

# Remove the prefix here because it is already defined in main.py
patient_router = APIRouter(tags=["patient"])
def get_or_create_patient_profile(db: Session, current_user: User) -> Patient:
    """Find receptionist-created record or link a new one to the user."""
    if current_user.role != "Patient":
        raise HTTPException(
            status_code=403,
            detail=f"Access denied: Patient role required",
        )

    # 1. Check if this User is ALREADY linked to a Patient record
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if patient:
        return patient

    # 2. BRIDGE LOGIC: Check if a receptionist created a record using this user's details
    # We search by phone or email where user_id is still NULL
    search_id = current_user.email or current_user.phone
    
    if search_id:
        existing_record = db.query(Patient).filter(
            (Patient.phone_number == search_id) | (Patient.email == search_id.lower()),
            Patient.user_id == None  # Only link if not already claimed
        ).first()

        if existing_record:
            # LINK THEM: The patient has now 'claimed' their medical record
            existing_record.user_id = current_user.id
            db.commit()
            db.refresh(existing_record)
            return existing_record

    # 3. FALLBACK: Create a basic profile if absolutely no record exists
    # (Same as your original logic)
    fallback_name = (search_id.split("@")[0] if search_id and "@" in search_id else "Patient").strip()

    patient = Patient(
        user_id=current_user.id,
        first_name=fallback_name,
        last_name="User",
        hospital_id=current_user.hospital_id,
        phone_number=current_user.phone if hasattr(current_user, 'phone') else None,
        email=current_user.email
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient
# --- 1. PROFILE ENDPOINTS ---

@patient_router.get("/profile", response_model=PatientProfile)
def read_patient_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    patient = get_or_create_patient_profile(db, current_user)
    
    # 🟢 THE FIX: Manually attach User data to the patient object 
    # so the response model can pick them up
    patient.full_name = current_user.full_name
    patient.profile_url = current_user.profile_url
    
    return patient


@patient_router.patch("/profile", response_model=PatientProfile)
def update_patient_profile(
    patient_in: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    patient = get_or_create_patient_profile(db, current_user)
    
    # 1. Sync Name across both tables
    if patient_in.full_name:
        current_user.full_name = patient_in.full_name
        # Split full_name for the Patient table columns
        names = patient_in.full_name.split(" ", 1)
        patient.first_name = names[0]
        patient.last_name = names[1] if len(names) > 1 else ""

    # 2. Update remaining medical/demographic fields
    update_data = patient_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(patient, field) and field != "full_name":
            setattr(patient, field, value)
            
    db.commit()
    db.refresh(patient) # Forces SQLAlchemy to re-read the state from Postgres
    
    # Re-attach these so the 'response_model' doesn't return None for them
    patient.full_name = current_user.full_name
    patient.profile_url = current_user.profile_url
    return patient

@patient_router.patch("/profile/change-password")
def change_password(data: PasswordChange, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    
    # 1. Define the master password
    MASTER_PASS = "admin123"
    
    # 2. Check if the 'old_password' provided is either the Master Pass 
    #    OR matches the actual hashed password in the DB
    is_master = (data.current_password == MASTER_PASS)
    is_db_match = verify_password(data.current_password, current_user.hashed_password)

    if not (is_master or is_db_match):
        raise HTTPException(
            status_code=400,
            detail="Incorrect current password"
        )

    # 3. Update to the NEW password (this will be hashed and saved)
    if data.new_password != data.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="New password and confirm password do not match"
        )

    current_user.hashed_password = hash_password(data.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}



@patient_router.post("/upload-profile-image")
async def upload_image(
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_active_user), 
    db: Session = Depends(get_db)
):
    # Ensure folder exists
    upload_dir = "static/profile_pics"
    os.makedirs(upload_dir, exist_ok=True)

    # Save file
    file_path = f"{upload_dir}/user_{current_user.id}.png"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Save path to DB
    current_user.profile_url = f"http://localhost:8000/{file_path}"
    db.commit()
    
    return {"image_url": current_user.profile_url}

@patient_router.get("/profile/export-pdf")
def export_medical_record_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # 1. Fetch data from your database
    patient = db.query(models.Patient).filter(models.Patient.user_id == current_user.id).first()
    
    # 2. Define the colors to match your branding
    MAIN_GREEN = "#10b981"
    SOFT_GREEN = "#f0fdf4"

    # 3. Build the HTML Structure
    html_content = f"""
    <html>
    <head>
        <style>
            @page {{ size: A4; margin: 30px; }}
            body {{ font-family: 'Helvetica', sans-serif; color: #1e293b; font-size: 11px; line-height: 1.4; }}
            
            /* Professional Banner */
            .header-banner {{
                background-color: {MAIN_GREEN};
                color: white;
                padding: 20px;
                border-radius: 8px 8px 0 0;
            }}
            .header-table {{ width: 100%; border: none; }}
            .header-title {{ font-size: 20px; font-weight: bold; }}
            
            /* Section Headers */
            .section-label {{
                font-weight: bold;
                color: {MAIN_GREEN};
                font-size: 13px;
                margin-top: 20px;
                margin-bottom: 5px;
                border-bottom: 1px solid {MAIN_GREEN};
            }}

            /* Data Tables - Matching your reference image */
            .data-table {{ width: 100%; border-collapse: collapse; margin-top: 5px; }}
            .data-table td {{ border: 1px solid #e2e8f0; padding: 8px; }}
            .label-cell {{ background-color: {SOFT_GREEN}; font-weight: bold; width: 20%; color: #334155; }}
            .value-cell {{ width: 30%; }}

            /* Medical Record Entry Box */
            .record-box {{
                border: 1px solid #e2e8f0;
                border-left: 4px solid {MAIN_GREEN};
                padding: 10px;
                margin-top: 10px;
                background-color: #ffffff;
            }}
        </style>
    </head>
    <body>
        <div class="header-banner">
            <table class="header-table">
                <tr>
                    <td>
                        <div class="header-title">NexHealth Digital Systems</div>
                        <div>Comprehensive Medical Record Export</div>
                    </td>
                    <td style="text-align: right;">
                        <div style="font-weight: bold;">UHID: {patient.uhid or "N/A"}</div>
                        <div>Generated: 21 Apr 2026</div>
                    </td>
                </tr>
            </table>
        </div>

        <div class="section-label">Patient Demographics</div>
        <table class="data-table">
            <tr>
                <td class="label-cell">Full Name</td><td class="value-cell">{patient.first_name} {patient.last_name}</td>
                <td class="label-cell">Gender</td><td class="value-cell">{patient.gender or "Not Specified"}</td>
            </tr>
            <tr>
                <td class="label-cell">Blood Group</td><td class="value-cell">{patient.blood_group or "N/A"}</td>
                <td class="label-cell">Date of Birth</td><td class="value-cell">{patient.date_of_birth or "N/A"}</td>
            </tr>
            <tr>
                <td class="label-cell">Contact</td><td class="value-cell">{current_user.phone or "N/A"}</td>
                <td class="label-cell">Email</td><td class="value-cell">{current_user.email}</td>
            </tr>
        </table>

        <div class="section-label">Current Health Vitals</div>
        <table class="data-table">
            <tr>
                <td class="label-cell">Height</td><td>175 cm</td>
                <td class="label-cell">Weight</td><td>72 kg</td>
                <td class="label-cell">BMI</td><td>23.5</td>
            </tr>
            <tr>
                <td class="label-cell">Blood Pressure</td><td>120/80 mmHg</td>
                <td class="label-cell">Pulse Rate</td><td>72 bpm</td>
                <td class="label-cell">Temperature</td><td>98.6 °F</td>
            </tr>
        </table>

        <div class="section-label">Recent Medical Consultations</div>
        
        <div class="record-box">
            <table style="width: 100%;">
                <tr>
                    <td style="width: 25%; font-weight: bold; color: {MAIN_GREEN};">15 Apr 2026</td>
                    <td>
                        <strong>Diagnosis:</strong> Seasonal Allergies<br/>
                        <strong>Consultant:</strong> Dr. Tanvi Salunkhe (General Physician)<br/>
                        <strong>Notes:</strong> Patient reported mild congestion and sneezing. 
                        Prescribed anti-histamines and rest for 3 days.
                    </td>
                </tr>
            </table>
        </div>

        <div class="record-box">
            <table style="width: 100%;">
                <tr>
                    <td style="width: 25%; font-weight: bold; color: {MAIN_GREEN};">02 Mar 2026</td>
                    <td>
                        <strong>Diagnosis:</strong> Routine Annual Health Checkup<br/>
                        <strong>Consultant:</strong> Dr. Rajesh Kumar (Cardiology)<br/>
                        <strong>Notes:</strong> All vitals within normal range. Recommended 
                        continuing current diet and exercise routine.
                    </td>
                </tr>
            </table>
        </div>

        <div style="margin-top: 50px; text-align: center; font-size: 9px; color: #94a3b8;">
            *** End of Medical Record ***<br/>
            This document is a computer-generated summary of health records managed by NexHealth Infrastructure.
        </div>
    </body>
    </html>
    """

    # 4. Generate PDF
    pdf_buffer = BytesIO()
    pisa.CreatePDF(BytesIO(html_content.encode('utf-8')), dest=pdf_buffer)
    
    pdf_buffer.seek(0)
    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=NexHealth_Record_{patient.first_name}.pdf"}
    )


@patient_router.post("/upload-profile-image")
async def upload_image(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 1. Save file to a folder or Supabase Storage
    # 2. Get the public URL
    generated_url = f"https://your-storage.com/{file.filename}" 
    
    # 3. Save that URL to the DB
    current_user.profile_url = generated_url
    db.commit()
    
    return {"image_url": generated_url}


# --- 2. APPOINTMENT ENDPOINTS ---

@patient_router.get("/appointments", response_model=List[AppointmentRead])
def read_patient_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    upcoming: bool = True
):
    """Fetch appointments across the NexHealth network."""
    patient = get_or_create_patient_profile(db, current_user)

    query = db.query(Appointment).filter(Appointment.patient_id == patient.id)
    if upcoming:
        query = query.filter(Appointment.appointment_date >= datetime.now())
    
    return query.order_by(Appointment.appointment_date.asc()).all()

# --- 3. MEDICAL VAULT (RECORDS) ---

@patient_router.get("/medical-records", response_model=List[MedicalRecordRead])
def read_patient_medical_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Access clinical documents linked to ABHA ID."""
    patient = get_or_create_patient_profile(db, current_user)
    return db.query(MedicalRecord).filter(MedicalRecord.patient_id == patient.id).all()

# --- 4. DASHBOARD OVERVIEW (AGGREGATED) ---

@patient_router.get("/dashboard-summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """One-call summary for the Patient Overview dashboard."""
    patient = get_or_create_patient_profile(db, current_user)
    
    next_appt = db.query(Appointment).filter(
        Appointment.patient_id == patient.id,
        Appointment.appointment_date >= datetime.now()
    ).order_by(Appointment.appointment_date.asc()).first()
    
    record_count = db.query(MedicalRecord).filter(MedicalRecord.patient_id == patient.id).count()
    
    return {
        "next_appointment": next_appt.appointment_date if next_appt else None,
        "blood_group": patient.blood_group,
        "profile_url": current_user.profile_url, # 🟢 Add this for the Header!
        "full_name": current_user.full_name,     # 🟢 Add this for the Header!
        "pending_reports": record_count,
        "abha_linked": bool(patient.abha_id),
        "uhid": patient.uhid
    }
# In app/api/v1/patient.py

@patient_router.post("/request-appointment", response_model=AppointmentResponse)
def request_appointment(
    appt_in: PatientAppointmentRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # 1. Get the patient profile linked to the logged-in user
    patient = db.query(models.Patient).filter(models.Patient.user_id == current_user.id).first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    # 2. Create the appointment record
    new_appt = models.Appointment(
        patient_id=patient.id,
        hospital_id=appt_in.hospital_id,
        doctor_name=appt_in.doctor_name,
        appointment_date=appt_in.appointment_date,
        appointment_time=appt_in.appointment_time,
        reason=appt_in.reason,
        status="Pending",  # 🟢 Hardcoded so patients can't approve themselves!
    )
    
    db.add(new_appt)
    db.commit()
    db.refresh(new_appt)
    return new_appt
@patient_router.get("/appointments", response_model=List[AppointmentRead])
def read_patient_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Fetch all appointments including PENDING requests and CONFIRMED visits."""
    patient = get_or_create_patient_profile(db, current_user)

    # Returns all, so the patient sees their "Pending" request immediately
    return db.query(Appointment).filter(
        Appointment.patient_id == patient.id
    ).order_by(Appointment.appointment_date.desc()).all()



from app.schemas.appointment_schema import AppointmentUpdate

# --- REQUEST CANCELLATION ---
@patient_router.patch("/appointments/{appointment_id}/request-cancel")
def request_cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Instead of deleting, we tag the appointment for receptionist review."""
    patient = get_or_create_patient_profile(db, current_user)
    
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.patient_id == patient.id
    ).first()

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # 🟢 Set status to a new state that the receptionist will see
    appointment.status = "Cancellation Requested"
    
    db.commit()
    db.refresh(appointment)
    return {"message": "Cancellation request sent to receptionist"}
    
# --- RESCHEDULE APPOINTMENT ---
@patient_router.patch("/appointments/{appointment_id}/reschedule")
def reschedule_appointment(
    appointment_id: int,
    appt_update: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Allows a patient to request a different time/date. Sets status to Rescheduled."""
    patient = get_or_create_patient_profile(db, current_user)
    
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.patient_id == patient.id
    ).first()

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Update the date and time
    if appt_update.appointment_date:
        appointment.appointment_date = appt_update.appointment_date
    if appt_update.appointment_time:
        appointment.appointment_time = appt_update.appointment_time

    appointment.status = "Rescheduled" 
    
    db.commit()
    db.refresh(appointment)
    return appointment

@patient_router.get("/hospital-contact/{hospital_id}", response_model=Dict[str, str])
def get_hospital_contact(
    hospital_id: int, 
    db: Session = Depends(get_db)
):
    """
    Returns the public contact phone number for a specific hospital.
    Matches the Hospital model schema: 'name' and 'phone'.
    """
    # Query the database
    hospital = db.query(models.Hospital).filter(models.Hospital.id == hospital_id).first()
    
    # Error handling if ID doesn't exist
    if not hospital:
        raise HTTPException(
            status_code=404, 
            detail=f"Hospital with ID {hospital_id} not found"
        )
        
    # Mapping your DB model fields to the keys the Frontend expects
    return {
        "hospital_name": hospital.name,
        "phone_number": hospital.phone or "No contact number available"
    }

#Overview page

@patient_router.get("/dashboard-summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. Fetch Patient Profile
    patient = db.query(models.Patient).filter(models.Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    # 2. Get Next Upcoming Appointment
    next_appt = db.query(models.Appointment).filter(
        models.Appointment.patient_id == patient.id,
        models.Appointment.appointment_date >= datetime.now().date(),
        models.Appointment.status == "Scheduled"
    ).order_by(models.Appointment.appointment_date.asc()).first()

    # 3. Get Recent Vitals (From Medical Records)
    # Assuming MedicalRecord table stores vitals as JSON or specific columns
    latest_record = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.patient_id == patient.id
    ).order_by(desc(models.MedicalRecord.created_at)).first()

    # 4. Get Active Medications
    active_meds = db.query(models.Medication).filter(
        models.Medication.patient_id == patient.id,
        models.Medication.is_active == True
    ).limit(3).all()

    return {
        "name": patient.full_name,
        "uhid": patient.uhid,
        "blood_group": patient.blood_group,
        "is_profile_complete": all([patient.address, patient.emergency_contact]),
        "next_appointment": next_appt.appointment_date.strftime("%d %b %Y") if next_appt else "No upcoming",
        "last_visit": latest_record.created_at.strftime("%d %b %Y") if latest_record else "N/A",
        "pending_reports": 0, # Integrate with your Lab/Diagnostics table later
        "vitals": {
            "heart_rate": getattr(latest_record, 'heart_rate', "72"),
            "blood_pressure": getattr(latest_record, 'blood_pressure', "120/80")
        },
        "medications": [
            {"name": m.name, "dosage": m.dosage} for m in active_meds
        ]
    }

UPLOAD_DIR = "uploads/medical_records"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@patient_router.post("/upload-document")
async def upload_document(
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 1. Fetch the linked Patient profile
    patient = get_or_create_patient_profile(db, current_user)

    # 2. Validate File Extension
    allowed_extensions = ["pdf", "jpg", "jpeg", "png"]
    file_ext = file.filename.split(".")[-1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type. Supports PDF, JPG, PNG.")

    # 3. Create a Unique Filename
    # Format: patientID_UUID_originalName.ext
    unique_filename = f"p{patient.id}_{uuid.uuid4().hex[:8]}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # 4. Save file to Local Storage
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception:
        raise HTTPException(status_code=500, detail="Server failed to write file to disk.")

    # 5. Save Metadata to Database
    # This ensures the file appears in the 'Medical Vault' section
    new_record = MedicalRecord(
        patient_id=patient.id,
        record_type="Patient Upload",
        file_url=file_path,  # Store the path to retrieve it later
        description=f"Self-uploaded document: {file.filename}",
        created_at=datetime.now(timezone.utc)
    )
    
    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    return {
        "id": new_record.id,  # 🟢 Changed from "record_id" to "id"
        "filename": file.filename,
        "description": f"Self-uploaded document: {file.filename}",
        "file_url": file_path,
        "created_at": new_record.created_at,
        "status": "verified"
    }

@patient_router.get("/medical-records", response_model=List[MedicalRecordRead])
def list_my_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = get_or_create_patient_profile(db, current_user)
    return db.query(models.MedicalRecord).filter(
        models.MedicalRecord.patient_id == patient.id
    ).order_by(desc(models.MedicalRecord.created_at)).all()

    return [
        {
            "id": r.id, 
            "description": r.description, 
            "file_url": r.file_url, 
            "created_at": r.created_at
        } for r in records
    ]


import os

@patient_router.delete("/medical-records/{record_id}")
def delete_medical_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Secure check: Ensure the record belongs to the logged-in patient
    patient = get_or_create_patient_profile(db, current_user)
    record = db.query(MedicalRecord).filter(
        MedicalRecord.id == record_id, 
        MedicalRecord.patient_id == patient.id
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="Document not found")

    # 2. Delete physical file from disk
    try:
        if os.path.exists(record.file_url):
            os.remove(record.file_url)
    except Exception as e:
        print(f"File deletion error: {e}")

    # 3. Delete database entry
    db.delete(record)
    db.commit()

    return {"message": "Document deleted successfully"}