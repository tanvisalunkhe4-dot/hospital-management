from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Dict, Any
from datetime import date
import shutil
import os
import io
from pydantic import BaseModel

# Internal Imports
from app.constants import (
    STATUS_VITALS_TAKEN, 
    STATUS_SCHEDULED, 
    STATUS_CHECKED_IN, 
    STATUS_IN_CONSULTATION, 
    STATUS_COMPLETED
)
from app.core.auth import get_current_user  # Ensure this matches the name in core/auth.py
from app.db import models
from app.db.session import get_db
from app.services.scribe import transcribe_audio, generate_medical_summary
from app.db.models import MedicineCatalog

# AI & Audio Processing
from faster_whisper import WhisperModel
from pydub import AudioSegment

router = APIRouter(prefix="/api/v1/doctor", tags=["Doctor Portal"])

# REMOVED local STATUS definitions to use the ones imported above
class ScribeTextRequest(BaseModel):
    raw_text: str

class FinalizeConsultationRequest(BaseModel):
    summary: str
    prescriptions: List[Dict[str, Any]]
    hospital_id: int
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
    # Resolve the doctor record once
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
            # CHANGE: Only show patients who finished Vitals
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

# ADD THIS NEW ENDPOINT FOR THE RESUME LOGIC
@router.get("/active-session/{staff_id}")
def check_active_consultation(staff_id: str, db: Session = Depends(get_db)):
    doctor = resolve_staff_record(staff_id, db)
    
    # Only look for a session that started TODAY
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
            models.Appointment.appointment_date == date.today() # Strict Date Filter
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
    # 1. Get the appointment the doctor is trying to start
    target_appt = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    
    if target_appt.status == STATUS_IN_CONSULTATION:
        return {"status": "already_started"}
    # 2. Check if the doctor ALREADY has a session active TODAY
    active_session = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == target_appt.doctor_id,
        models.Appointment.status == "In Consultation",
        models.Appointment.appointment_date == date.today(), # <--- THE CRITICAL ADDITION
        models.Appointment.id != appointment_id 
    ).first()

    if active_session:
        raise HTTPException(
            status_code=400, 
            detail="You already have an active consultation in progress for today."
        )

    # 3. If no active session today, proceed to start the new one
    target_appt.status = STATUS_IN_CONSULTATION
    db.commit()
    return {"status": "started"}



@router.post("/consultation/finish/{appointment_id}")
async def finish_consultation(
    appointment_id: int,
    data: FinalizeConsultationRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    print("========== AUTH DEBUG ==========")
    print("TYPE:", type(current_user))
    print("CURRENT USER:", current_user)

    try:
        print("EMAIL:", current_user.email)
    except Exception as e:
        print("EMAIL ACCESS ERROR:", str(e))

    print("================================")

    # STEP 1: Find doctor profile using logged-in email
    doctor = db.query(models.Staff).filter(
        models.Staff.email.ilike(current_user.email)
    ).first()

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail=f"No doctor profile found for email: {current_user.email}"
        )

    # STEP 2: Fetch appointment ONLY by appointment ID
    appointment = db.query(models.Appointment).filter(
        models.Appointment.id == appointment_id
    ).first()

    if not appointment:
        raise HTTPException(
            status_code=404,
            detail=f"Appointment {appointment_id} not found"
        )

    # DEBUG PRINTS
    print("========== DEBUG ==========")
    print("Logged User Email:", current_user.email)
    print("Doctor ID:", doctor.id)
    print("Appointment Doctor ID:", appointment.doctor_id)
    print("===========================")

    # STEP 3: Check ownership manually
    if appointment.doctor_id != doctor.id:
        raise HTTPException(
            status_code=403,
            detail={
                "message": "This appointment is not assigned to the logged-in doctor",
                "logged_doctor_id": doctor.id,
                "appointment_doctor_id": appointment.doctor_id
            }
        )

    try:
        # STEP 4: Complete consultation
        appointment.status = STATUS_COMPLETED

        db.commit()

        return {
            "status": "success",
            "message": "Consultation completed successfully"
        }

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("/medical-records/all")
def get_all_records(db: Session = Depends(get_db)):
    """Fetches full clinical history for the Doctor's record archive."""
    results = (
        db.query(
            models.MedicalRecord.id,
            models.Patient.first_name,
            models.Patient.last_name,
            models.MedicalRecord.diagnosis,
            models.MedicalRecord.created_at,
        )
        .join(models.Patient, models.MedicalRecord.patient_id == models.Patient.id)
        .all()
    )

    return [
        {
            "id": f"NX-{r.id}", # Standardized Autonex ID format
            "patient_name": f"{r.first_name} {r.last_name}",
            "visit_date": r.created_at.strftime("%Y-%m-%d") if r.created_at else "N/A",
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
        "sp_o2": latest_vital.sp_o2 or "--" # From your Vitals model
    }


@router.post("/consultation/scribe-process")
async def handle_ai_scribe(file: UploadFile = File(...)):
    # 1. Save temporary audio file
    temp_file = f"temp_{file.filename}"
    try:
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 2. Audio -> Text (Whisper)
        raw_text = transcribe_audio(temp_file)
        
        if not raw_text.strip():
            # Return a friendly message if Whisper finds nothing
            return {
                "raw_transcript": "",
                "clinical_note": "No audio detected. Please ensure your microphone is working."
            }

        # 3. Text -> Structured AI Summary (Gemini 2.0 Flash)
        # We MUST await this because generate_medical_summary is now 'async'
        clinical_summary = await generate_medical_summary(raw_text)
        
        return {
            "raw_transcript": raw_text,
            "clinical_note": clinical_summary
        }
        
    except Exception as e:
        print(f"Scribe Router Error: {e}")
        # We return a 200 with an error message so the UI doesn't crash
        return {
            "raw_transcript": "Error during processing",
            "clinical_note": "AI Summarization failed. Please enter notes manually."
        }
    
    finally:
        # 4. Clean up the audio file immediately to save disk space
        if os.path.exists(temp_file):
            os.remove(temp_file)

@router.post("/consultation/finish/{appointment_id}")
async def finish_consultation(
    appointment_id: int,
    data: FinalizeConsultationRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. Resolve Staff record
    staff_record = db.query(models.Staff).filter(
        models.Staff.email.ilike(current_user.email)
    ).first()

    if not staff_record:
        raise HTTPException(status_code=404, detail="Staff profile not found")

    # 2. Resolve specific Doctor Profile for MedicalRecord FK
    doctor_profile = db.query(models.Doctor).filter(
        models.Doctor.staff_ref_id == staff_record.id
    ).first()

    if not doctor_profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    # 3. Fetch Appointment
    appointment = db.query(models.Appointment).filter(
        models.Appointment.id == appointment_id
    ).first()

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # 4. Security Check
    if appointment.doctor_id != staff_record.id:
        raise HTTPException(status_code=403, detail="Unauthorized: Not your appointment")

    try:
        # 5. Save the Medical Record
        new_record = models.MedicalRecord(
            patient_id=appointment.patient_id,
            doctor_id=doctor_profile.id,
            appointment_id=appointment_id,
            hospital_id=data.hospital_id,
            diagnosis=data.summary,
            treatment_plan="See Prescription"
        )
        db.add(new_record)
        
        # 6. Flush to get the record ID for prescriptions
        db.flush() 

        # 7. Save Prescriptions
        for med in data.prescriptions:
            new_prescription = models.Prescription(
                medical_record_id=new_record.id,
                hospital_id=data.hospital_id,
                medicine_name=med.get("name") or med.get("medicine_name"),
                dosage=med.get("dosage"),
                frequency=med.get("frequency"),
                duration=med.get("duration", "5 Days"),
                instructions=med.get("instructions", ""),
                route=med.get("route", "Oral")
            )
            db.add(new_prescription)

        # 8. Update Status for Pharmacy Queue
        appointment.status = "Pending-Pharmacy"
        
        db.commit()
        return {"status": "success", "message": "Consultation sent to Pharmacy"}

    except Exception as e:
        db.rollback()
        print(f"FINALIZE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
# --- AI Scribe Logic (Streaming & Finalization) ---

model = WhisperModel("base", device="cpu", compute_type="int8")

@router.websocket("/ws/scribe/stream")
async def websocket_scribe_stream(websocket: WebSocket):
    await websocket.accept()
    
    # Store the EBML header from the very first packet
    initial_header = None
    # Current working buffer for the chunk
    current_chunk = bytearray()
    
    try:
        while True:
            chunk = await websocket.receive_bytes()
            
            # 1. Capture the header from the first packet ever received
            if initial_header is None:
                initial_header = chunk
            
            current_chunk.extend(chunk)

            # 2. Process when we have ~0.5MB of new data
            if len(current_chunk) > 500000: 
                try:
                    # 3. CRITICAL FIX: Prepend the initial header to the current chunk
                    # This tells FFmpeg: "This is a WebM file with X codec"
                    processing_buffer = initial_header + current_chunk
                    
                    audio_fp = io.BytesIO(processing_buffer)
                    
                    # pydub will now find the EBML header and won't crash
                    audio_segment = AudioSegment.from_file(audio_fp, format="webm")
                    
                    # Convert to WAV for Whisper
                    wav_io = io.BytesIO()
                    audio_segment.export(wav_io, format="wav")
                    wav_io.seek(0)

                    # Transcribe
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
                        
                        # 4. Clear the chunk but keep the header for the next round
                        current_chunk = bytearray()
                    
                except Exception as e:
                    # If it's a mid-frame cut, we just keep the data and wait for more
                    print(f"Slice decoding skipped (waiting for more data): {e}")
                    continue

    except WebSocketDisconnect:
        print("Scribe WebSocket disconnected.")

@router.get("/search-medicines")
def search_medicines(
    q: str = Query(..., min_length=2), 
    db: Session = Depends(get_db)
):
    # This query searches the catalog and returns the top 10 matches
    results = db.query(MedicineCatalog).filter(
        MedicineCatalog.name.ilike(f"%{q}%")
    ).limit(10).all()
    
    return results

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
    # 1. Print data to see what is missing in your terminal
    print(f"DEBUG: Incoming Data -> {data}")

    if not data.get("patient_id") or not data.get("hospital_id"):
        raise HTTPException(status_code=400, detail="Missing Patient or Hospital ID")

    new_request = models.LabRequest(
        hospital_id=data.get("hospital_id"),
        patient_id=data.get("patient_id"),
        # Use .get(key, default) to prevent crashes on optional fields
        appointment_id=data.get("appointment_id"),
        doctor_id=data.get("doctor_id"),
        test_name=data.get("test_name"),
        category=data.get("category"),
        status="Pending",
        priority=data.get("priority", "Normal")
    )
    
    try:
        db.add(new_request)
        db.commit()
        db.refresh(new_request)
        return {"status": "success", "message": "Request sent to Lab", "request_id": new_request.id}
    except Exception as e:
        db.rollback()
        # 2. Print the actual SQL error so you don't have to guess
        print(f"SQL ERROR: {str(e)}") 
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/lab-test-catalog")
def get_lab_catalog(db: Session = Depends(get_db)):
    # Returns the live list of tests for your "Nexus" UI selection
    tests = db.query(models.LabTestCatalog).filter(models.LabTestCatalog.is_active == True).all()
    return tests
@router.get("/patient/{patient_id}/lab-reports")
def get_patient_lab_reports(patient_id: int, db: Session = Depends(get_db)):
    """
    Fetches history of lab requests joined with patient details for identification.
    """
    # Use a JOIN to get the patient's name along with the lab request data
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

    # Flatten the result so the frontend receives a clean list of objects
    reports = []
    for request, p_name in results:
        report_data = {
            "id": request.id,
            "test_name": request.test_name,
            "category": request.category,
            "status": request.status,
            "requested_at": request.requested_at,
            "patient_name": p_name, # Critical for identification
            "priority": request.priority
        }
        reports.append(report_data)
    
    return reports