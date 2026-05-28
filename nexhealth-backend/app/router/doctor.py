from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from typing import List, Dict, Any
from datetime import date, datetime
import shutil
import os
import io
from pydantic import BaseModel

from app.constants import (
    STATUS_VITALS_TAKEN, 
    STATUS_SCHEDULED, 
    STATUS_CHECKED_IN, 
    STATUS_IN_CONSULTATION, 
    STATUS_COMPLETED
)
from app.core.auth import get_current_user  
from app.db import models
from app.db.session import get_db
from app.services.scribe import transcribe_audio, generate_medical_summary
from app.db.models import MedicineCatalog

from faster_whisper import WhisperModel
from pydub import AudioSegment

router = APIRouter(tags=["Doctor Portal"])

class ScribeTextRequest(BaseModel):
    raw_text: str

class LabTestItem(BaseModel):
    test_name: str
    priority: str = "NORMAL"

class FinalizeConsultationRequest(BaseModel):
    summary: str
    prescriptions: List[Dict[str, Any]]
    hospital_id: int
    appointment_id: int  
    lab_tests: List[LabTestItem]
class PrescriptionSchema(BaseModel):
    medicine: str
    dosage: str
    duration: str
    frequency: str


class MedicalHistorySchema(BaseModel):
    id: int
    diagnosis: str
    date: datetime
    prescriptions: List[PrescriptionSchema]

STATUS_VITALS_TAKEN = "Vitals Taken"
STATUS_SCHEDULED = "Scheduled"
STATUS_CHECKED_IN = "Checked In"
STATUS_IN_CONSULTATION = "In Consultation"
STATUS_COMPLETED = "Completed"

def resolve_staff_record(staff_id: str, db: Session) -> models.Staff:
    """Helper to find internal database ID using the public staff_id."""
    staff = db.query(models.Staff).filter(
        models.Staff.staff_id == staff_id,
        models.Staff.is_active == True
    ).first()
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Staff profile for {staff_id} not found.",
        )
    return staff

@router.get("/queue/{staff_id}")
def get_doctor_queue(staff_id: str, db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    doctor = resolve_staff_record(staff_id, db)

    rows = (
        db.query(
            models.Appointment.id.label("appt_id"),
            models.Appointment.appointment_time,
            models.Appointment.reason,
            models.Patient.id.label("patient_id"),
            (models.Patient.first_name + " " + models.Patient.last_name).label("patient_name"),
        )
        .join(models.Patient, models.Appointment.patient_id == models.Patient.id)
        .filter(
            models.Appointment.doctor_id == doctor.id,
            models.Appointment.hospital_id == doctor.hospital_id,
            models.Appointment.status == STATUS_VITALS_TAKEN, 
            models.Appointment.appointment_date == date.today(),
        )
        .order_by(models.Appointment.appointment_time.asc())
        .all()
    )

    return [
        {
            "appt_id": r.appt_id,
            "patient_id": r.patient_id,
            "patient_name": r.patient_name,
            "reason": r.reason,
            "time": r.appointment_time.strftime("%H:%M") if r.appointment_time else "N/A",
        }
        for r in rows
    ]

@router.get("/active-session/{staff_id}")
def check_active_consultation(staff_id: str, db: Session = Depends(get_db)):
    doctor = resolve_staff_record(staff_id, db)
    
    active_row = (
        db.query(
            models.Appointment.id,
            models.Patient.id.label("patient_id"),
            (models.Patient.first_name + " " + models.Patient.last_name).label("patient_name"),
            models.Appointment.reason
        )
        .join(models.Patient, models.Appointment.patient_id == models.Patient.id)
        .filter(
            models.Appointment.doctor_id == doctor.id,
            models.Appointment.status == STATUS_IN_CONSULTATION,
            models.Appointment.appointment_date == date.today()
        )
        .first()
    )
    
    if active_row:
        return {
            "appt_id": active_row.id,
            "patient_id": active_row.patient_id,
            "patient_name": active_row.patient_name,
            "reason": active_row.reason
        }
    return None

@router.post("/consultation/start/{appointment_id}")
def start_consultation(appointment_id: int, db: Session = Depends(get_db)):
    target_appt = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not target_appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    if target_appt.status == STATUS_IN_CONSULTATION:
        return {"status": "already_started"}

    active_session = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == target_appt.doctor_id,
        models.Appointment.status == STATUS_IN_CONSULTATION,
        models.Appointment.appointment_date == date.today(),
        models.Appointment.id != appointment_id 
    ).first()

    if active_session:
        raise HTTPException(
            status_code=400, 
            detail="You already have an active consultation in progress for today."
        )

    target_appt.status = STATUS_IN_CONSULTATION
    db.commit()
    return {"status": "started"}
@router.get("/medical-records/all")
def get_all_records(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Get logged in doctor's staff record
    staff_record = db.query(models.Staff).filter(
        models.Staff.email.ilike(current_user.email)
    ).first()

    if not staff_record:
        return []

    # Get doctor profile
    doctor_profile = db.query(models.Doctor).filter(
        models.Doctor.staff_ref_id == staff_record.id
    ).first()

    if not doctor_profile:
        return []

    # Fetch only records belonging to this doctor
    results = (
        db.query(
            models.MedicalRecord.id,
            models.MedicalRecord.patient_id,
            models.Patient.first_name,
            models.Patient.last_name,
            models.MedicalRecord.diagnosis,
            models.MedicalRecord.created_at,
        )
        .join(
            models.Patient,
            models.MedicalRecord.patient_id == models.Patient.id
        )
        .filter(models.MedicalRecord.doctor_id == doctor_profile.id)
        .all()
    )

    return [
        {
            "id": f"NX-{r.id}",
            "record_id": f"NX-{r.id}",
            "patient_id": r.patient_id,
            "patient_name": f"{r.first_name} {r.last_name}",
            "visit_date": (
                r.created_at.strftime("%Y-%m-%d")
                if r.created_at else "N/A"
            ),
            "diagnosis": r.diagnosis,
        }
        for r in results
    ]

@router.get("/patient/{patient_id}/latest-vitals")
def get_latest_vitals(patient_id: int, db: Session = Depends(get_db)):
    latest_vital = db.query(models.Vitals)\
        .filter(models.Vitals.patient_id == patient_id)\
        .order_by(desc(models.Vitals.recorded_at))\
        .first()
    
    if not latest_vital:
        return {
            "blood_pressure": None,
            "pulse_rate": 0,
            "temperature": 0.0,
            "sp_o2": 0,
            "remarks": "" 
        }
        
    return {
        "blood_pressure": latest_vital.blood_pressure,
        "pulse_rate": latest_vital.pulse_rate,
        "temperature": latest_vital.temperature,
        "sp_o2": latest_vital.sp_o2 or "--"
    }

@router.post("/consultation/scribe-process")
async def handle_ai_scribe(file: UploadFile = File(...)):
    temp_file = f"temp_{file.filename}"
    try:
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        raw_text = transcribe_audio(temp_file)
        
        if not raw_text.strip():
            return {
                "raw_transcript": "",
                "clinical_note": "No audio detected. Please ensure your microphone is working."
            }

        clinical_summary = await generate_medical_summary(raw_text)
        return {
            "raw_transcript": raw_text,
            "clinical_note": clinical_summary
        }
    except Exception as e:
        print(f"Scribe Router Error: {e}")
        return {
            "raw_transcript": "Error during processing",
            "clinical_note": "AI Summarization failed. Please enter notes manually."
        }
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)

# --- WORKFLOW CRITICAL FINALIZE ENDPOINT ---
@router.post("/consultation/finish/{appointment_id}")
async def finish_consultation(
    appointment_id: int,
    data: FinalizeConsultationRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    staff_record = db.query(models.Staff).filter(
        models.Staff.email.ilike(current_user.email)
    ).first()

    if not staff_record:
        raise HTTPException(status_code=404, detail="Staff profile not found")

    doctor_profile = db.query(models.Doctor).filter(
        models.Doctor.staff_ref_id == staff_record.id
    ).first()

    if not doctor_profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    appointment = db.query(models.Appointment).filter(
        models.Appointment.id == appointment_id
    ).first()

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # FIX 1: Support checking against both structural setup patterns (Staff ID or Doctor Profile ID)
    if appointment.doctor_id not in [staff_record.id, doctor_profile.id]:
        raise HTTPException(status_code=403, detail="Unauthorized: Not your appointment")

    try:
        new_record = models.MedicalRecord(
            patient_id=appointment.patient_id,
            doctor_id=doctor_profile.id,
            appointment_id=appointment_id,
            hospital_id=data.hospital_id,
            diagnosis=data.summary,
            treatment_plan="See Prescription"
        )
        db.add(new_record)
        db.flush() 

        # Process Prescriptions safely
        for med in data.prescriptions:
            freq_str = med.get("frequency", "1-0-1")
            duration_str = med.get("duration", "5 Days")
            route = med.get("route", "Oral")
            name = (med.get("name") or med.get("medicine_name", "")).lower()

            try:
                days = int(''.join(filter(str.isdigit, duration_str)))
            except:
                days = 5

            try:
                per_day = sum(int(x) for x in freq_str.split('-') if x.isdigit())
            except:
                per_day = 2

            if any(unit in name for unit in ["tablet", "tab", "capsule", "cap"]):
                final_qty = per_day * days
            else:
                final_qty = 1 

            new_prescription = models.Prescription(
                medical_record_id=new_record.id,
                hospital_id=data.hospital_id,
                medicine_name=med.get("name") or med.get("medicine_name"),
                dosage=med.get("dosage"),
                quantity=final_qty,  
                frequency=freq_str,
                duration=duration_str,
                instructions=med.get("instructions", ""),
                route=route,
                is_available=True, # Added initialization fallback explicitly
                price=0.0
            )
            db.add(new_prescription)

        # Process Lab Requests safely
        for test_obj in data.lab_tests:
            test_info = db.query(models.LabTestCatalog).filter(
                models.LabTestCatalog.test_name == test_obj.test_name
            ).first()
            
            new_lab_request = models.LabRequest(
                hospital_id=data.hospital_id,
                patient_id=appointment.patient_id,
                appointment_id=appointment_id,
                doctor_id=doctor_profile.id, # Ensured structural profile ownership references match
                test_name=test_obj.test_name,
                price_at_request=test_info.base_price if test_info else 0.0,
                status="Pending",
                priority=test_obj.priority
            )
            db.add(new_lab_request)

        # FIX 2: State-Machine Fallback Route Logic
        # If no prescriptions were provided, pass straight to front-desk billing pipeline 
        if len(data.prescriptions) == 0:
            appointment.status = "Pharmacy-Verified"
        else:
            appointment.status = "Pending-Pharmacy"
        
        db.commit()
        return {
            "status": "success", 
            "message": f"Consultation finalized. Workflow routed to: {appointment.status}"
        }

    except Exception as e:
        db.rollback()
        print(f"FINALIZE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# --- AI Scribe Logic (Streaming & Finalization) ---
model = WhisperModel("base", device="cpu", compute_type="int8")

@router.websocket("/ws/scribe/stream")
async def websocket_scribe_stream(websocket: WebSocket):
    await websocket.accept()
    initial_header = None
    current_chunk = bytearray()
    
    try:
        while True:
            chunk = await websocket.receive_bytes()
            if initial_header is None:
                initial_header = chunk
            current_chunk.extend(chunk)

            if len(current_chunk) > 16000: 
                try:
                    processing_buffer = initial_header + current_chunk
                    audio_fp = io.BytesIO(processing_buffer)
                    audio_segment = AudioSegment.from_file(audio_fp, format="webm")
                    
                    wav_io = io.BytesIO()
                    audio_segment.export(wav_io, format="wav")
                    wav_io.seek(0)

                    segments, _ = model.transcribe(
                        wav_io, 
                        beam_size=5,
                        vad_filter=True,
                        initial_prompt="A medical consultation regarding patient symptoms and diagnosis."
                    )
                    transcript = " ".join([segment.text for segment in segments]).strip()

                    if transcript:
                        await websocket.send_json({
                            "type": "partial_transcript",
                            "text": transcript
                        })
                        current_chunk = bytearray()
                except Exception as e:
                    print(f"Slice decoding skipped (waiting for more data): {e}")
                    continue
    except WebSocketDisconnect:
        print("Scribe WebSocket disconnected.")

@router.get("/search-medicines")
def search_medicines(q: str = Query(..., min_length=2), db: Session = Depends(get_db)):
    return db.query(MedicineCatalog).filter(MedicineCatalog.name.ilike(f"%{q}%")).limit(10).all()

@router.post("/consultation/scribe-process-text")
async def process_scribe_text(request: ScribeTextRequest):
    if not request.raw_text.strip():
        raise HTTPException(status_code=400, detail="No transcript data provided.")
    try:
        clinical_summary = await generate_medical_summary(request.raw_text)
        return {"clinical_note": clinical_summary}
    except Exception as e:
        print(f"Gemini Processing Error: {e}")
        return {"clinical_note": request.raw_text}

@router.post("/lab-requests")
async def create_lab_request(data: dict, db: Session = Depends(get_db)):
    if not data.get("patient_id") or not data.get("hospital_id"):
        raise HTTPException(status_code=400, detail="Missing Patient or Hospital ID")

    test_info = db.query(models.LabTestCatalog).filter(
        models.LabTestCatalog.test_name == data.get("test_name")
    ).first()
    initial_price = test_info.base_price if test_info else 0.0

    new_request = models.LabRequest(
        hospital_id=data.get("hospital_id"),
        patient_id=data.get("patient_id"),
        appointment_id=data.get("appointment_id"), 
        doctor_id=data.get("doctor_id"),
        test_name=data.get("test_name"),
        price_at_request=initial_price, 
        category=data.get("category"),
        status="Pending",
        priority=data.get("priority", "Normal")
    )
    
    try:
        db.add(new_request)
        db.commit()
        db.refresh(new_request)
        return {
            "status": "success", 
            "message": f"Request for {new_request.test_name} sent to Lab", 
            "request_id": new_request.id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")

@router.get("/lab-test-catalog")
def get_lab_catalog(db: Session = Depends(get_db)):
    return db.query(models.LabTestCatalog).filter(models.LabTestCatalog.is_active == True).all()

@router.get("/patient/{patient_id}/lab-reports")
def get_patient_lab_reports(patient_id: int, db: Session = Depends(get_db)):
    results = (
        db.query(
            models.LabRequest,
            (models.Patient.first_name + " " + models.Patient.last_name).label("patient_name")
        )
        .join(models.Patient, models.LabRequest.patient_id == models.Patient.id)
        .filter(models.LabRequest.patient_id == patient_id)
        .order_by(desc(models.LabRequest.requested_at))
        .all()
    )

    return [
        {
            "id": r.LabRequest.id,
            "test_name": r.LabRequest.test_name,
            "category": r.LabRequest.category,
            "status": r.LabRequest.status,
            "requested_at": r.LabRequest.requested_at,
            "patient_name": r.patient_name,
            "priority": r.LabRequest.priority
        } for r in results
    ]

@router.patch("/lab-reports/{request_id}/accept")
def accept_lab_report(request_id: int, db: Session = Depends(get_db)):
    lab_request = db.query(models.LabRequest).filter(models.LabRequest.id == request_id).first()
    if not lab_request:
        raise HTTPException(status_code=404, detail="Lab request not found.")

    lab_request.status = "Accepted" 
    try:
        db.commit()
        return {
            "status": "success", 
            "message": f"Report {lab_request.test_name} accepted successfully.",
            "request_id": lab_request.id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update report status.")

@router.get("/patient/{patient_id}/history")
def get_patient_medical_history(patient_id: int, db: Session = Depends(get_db)):
    """
    Fetches history, allergies, and conditions for a specific patient,
    including vitals linked to each visit's appointment.
    """
    # 1. Fetch Patient Basic Info
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # 2. Fetch Visit History (Medical Records)
    history = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.patient_id == patient_id
    ).order_by(desc(models.MedicalRecord.created_at)).all()

    # 3. Format Response
    visit_history_data = []
    for r in history:
        # Fetch vitals associated with the specific appointment of this record
        vitals = db.query(models.Vitals).filter(
            models.Vitals.appointment_id == r.appointment_id
        ).first()
        
        visit_history_data.append({
            "id": f"NX-{r.id}",
            "visit_date": r.created_at.strftime("%Y-%m-%d") if r.created_at else "N/A",
            "diagnosis": r.diagnosis,
            "notes": r.treatment_plan,
            # Dynamically pass vitals if they exist, otherwise None
            "systolic": vitals.blood_pressure.split('/')[0] if vitals and vitals.blood_pressure and '/' in vitals.blood_pressure else None,
            "diastolic": vitals.blood_pressure.split('/')[1] if vitals and vitals.blood_pressure and '/' in vitals.blood_pressure else None,
            "temperature": vitals.temperature if vitals else None
        })

    return {
        "patient_info": {
            "name": f"{patient.first_name} {patient.last_name}",
            "age": patient.age if hasattr(patient, 'age') else "N/A",
            "blood_group": patient.blood_group if hasattr(patient, 'blood_group') else "N/A"
        },
        "allergies": [], 
        "chronic_conditions": [], 
        "visit_history": visit_history_data
    }

@router.get("/reports/pending-review/{staff_id}")
def get_reports_for_doctor_review(staff_id: str, db: Session = Depends(get_db)):
    """
    Fetches reports that have been 'Verified' by the Lab, 
    so the doctor can review them.
    """
    doctor = resolve_staff_record(staff_id, db)
    
    # We look for LabRequests where the doctor_id matches 
    # AND the status is 'Verified'
    reports = db.query(models.LabRequest)\
        .filter(
            models.LabRequest.doctor_id == doctor.id,
            models.LabRequest.status == "Verified"
        )\
        .order_by(desc(models.LabRequest.report_generated_at))\
        .all()
    
    return [
        {
            "id": r.id,
            "patient_name": f"{r.patient.first_name} {r.patient.last_name}",
            "test_name": r.test_name,
            "report_url": r.report_file_url,
            "generated_at": r.report_generated_at
        }
        for r in reports
    ]

@router.get("/patient/{patient_id}/prescriptions")
def get_patient_prescriptions(patient_id: int, db: Session = Depends(get_db)):
    # 1. Fetch records with pre-loaded prescriptions
    records = db.query(models.MedicalRecord)\
        .options(joinedload(models.MedicalRecord.prescriptions))\
        .filter(models.MedicalRecord.patient_id == patient_id)\
        .order_by(models.MedicalRecord.created_at.desc())\
        .all()
    
    # 2. Return structured, nested data
    return [
        {
            "visit_date": r.created_at.strftime("%Y-%m-%d"),
            "diagnosis": r.diagnosis,
            "prescriptions": [
                {
                    "medicine": p.medicine_name,
                    "dosage": p.dosage,
                    "frequency": p.frequency,
                    "duration": p.duration,
                    "quantity": p.quantity
                } for p in r.prescriptions
            ]
        } for r in records
    ]

@router.get("/patient/{patient_id}/full-history")
def get_patient_full_history(patient_id: int, db: Session = Depends(get_db)):
    # Fetch medical records with pre-loaded prescriptions
    records = db.query(models.MedicalRecord)\
        .options(joinedload(models.MedicalRecord.prescriptions))\
        .filter(models.MedicalRecord.patient_id == patient_id)\
        .order_by(models.MedicalRecord.created_at.desc())\
        .all()
    
    # Return a structured response
    return [
        {
            "id": r.id,
            "diagnosis": r.diagnosis,
            "date": r.created_at,
            "prescriptions": [
                {
                    "medicine": p.medicine_name,
                    "dosage": p.dosage,
                    "duration": p.duration,
                    "frequency": p.frequency
                } for p in r.prescriptions
            ]
        } for r in records
    ]
