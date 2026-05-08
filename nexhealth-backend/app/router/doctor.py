from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Dict, Any
from datetime import date
import shutil
import os
import io
from pydantic import BaseModel
# Internal Imports
from app.db import models
from app.db.session import get_db
from app.services.scribe import transcribe_audio, generate_medical_summary

# AI & Audio Processing
from faster_whisper import WhisperModel
from pydub import AudioSegment

router = APIRouter(prefix="/api/v1/doctor", tags=["Doctor Portal"])
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
    staff = db.query(models.Staff).filter(models.Staff.staff_id == staff_id).first()
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
            "id": r.appt_id,
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
            "id": active_row.id,
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
def finish_consultation(
    appointment_id: int, 
    data: FinalizeConsultationRequest, 
    db: Session = Depends(get_db)
):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    try:
        # Create the Medical Record
        new_record = models.MedicalRecord(
            patient_id=appointment.patient_id,
            doctor_id=appointment.doctor_id,
            appointment_id=appointment.id,
            hospital_id=appointment.hospital_id, # This pulls from the DB record
            clinical_notes=data.summary,         # Map summary to clinical_notes
            diagnosis="Consultation Summary",    # Default or extract from summary
            record_type="Prescription",
            created_at=date.today()
        )
        db.add(new_record)
        db.flush() 

        # Save prescriptions
        for med in data.prescriptions:
            new_prescription = models.Prescription(
                medical_record_id=new_record.id,
                medicine_name=med.get('name'),
                dosage=med.get('dosage'),
                frequency=med.get('frequency'),
                duration="As per advice"
            )
            db.add(new_prescription)

        appointment.status = STATUS_COMPLETED
        db.commit()
        return {"status": "success", "message": "Consultation finalized."}
    
    except Exception as e:
        db.rollback()
        print(f"CRITICAL ERROR: {e}")
        # This will show the exact missing field in your terminal
        raise HTTPException(status_code=500, detail=f"Finalization failed: {str(e)}")

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