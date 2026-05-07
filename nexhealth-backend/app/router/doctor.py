from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from sqlalchemy import desc
from datetime import date
from app.db import models
from app.db.session import get_db
import shutil
import os
from app.services.scribe import transcribe_audio, generate_medical_summary
from fastapi import WebSocket, WebSocketDisconnect
import io
from faster_whisper import WhisperModel
from pydub import AudioSegment


router = APIRouter(prefix="/api/v1/doctor", tags=["Doctor Portal"])

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
def finish_consultation(appointment_id: int, db: Session = Depends(get_db)):
    # 1. Fetch the appointment
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    try:
        # 2. Update the status so the UI reflects the change (Receptionist view)
        appointment.status = STATUS_COMPLETED
        
        # 3. TEMPORARILY DISABLED: Billing Logic
        # We comment this out because the 'invoices' table schema is not yet updated
        """
        new_invoice = models.Invoice(
            patient_id=appointment.patient_id,
            hospital_id=appointment.hospital_id,
            appointment_id=appointment.id,
            doctor_id=appointment.doctor_id,
            total_amount=500.00,
            status="Pending"
        )
        db.add(new_invoice)
        """
        
        db.commit()
        return {"status": "success", "message": "Consultation finalized successfully."}
    
    except Exception as e:
        db.rollback()
        print(f"Error finalizing consultation: {e}")
        raise HTTPException(status_code=500, detail="Failed to finalize consultation.")

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




# Load model
model = WhisperModel("tiny", device="cpu", compute_type="int8")

@router.websocket("/ws/scribe/stream")
async def websocket_scribe_stream(websocket: WebSocket):
    await websocket.accept()
    # We keep a 'full_session_buffer' to ensure FFmpeg always has the initial header
    full_session_buffer = bytearray()
    last_processed_size = 0
    
    try:
        while True:
            chunk = await websocket.receive_bytes()
            full_session_buffer.extend(chunk)

            # Process when we have significant new data (approx 150KB - 200KB)
            # FFmpeg needs a larger buffer to correctly identify the WebM container
            if len(full_session_buffer) - last_processed_size > 180000:
                try:
                    # Create a file-like object from the buffer
                    audio_fp = io.BytesIO(full_session_buffer)
                    
                    # Force 'webm' format so pydub doesn't have to guess
                    audio_segment = AudioSegment.from_file(audio_fp, format="webm")
                    
                    # Slice the audio to only process the NEW part to avoid repetitions
                    new_audio = audio_segment[last_processed_size // 100:] # rough estimate
                    
                    # Export to WAV in memory
                    wav_io = io.BytesIO()
                    audio_segment.export(wav_io, format="wav")
                    wav_io.seek(0)

                    # Transcribe
                    segments, _ = model.transcribe(wav_io, beam_size=5)
                    transcript = " ".join([segment.text for segment in segments])

                    if transcript.strip():
                        await websocket.send_json({
                            "type": "partial_transcript",
                            "text": transcript
                        })
                    
                    # Update tracking - DO NOT clear full_session_buffer
                    # If you clear it, you lose the WebM header required by FFmpeg
                    last_processed_size = len(full_session_buffer)

                except Exception as inner_error:
                    # Often happens if the chunk is cut mid-frame; just wait for next chunk
                    continue

    except WebSocketDisconnect:
        print("Doctor disconnected.")
    except Exception as e:
        print(f"Streaming Error: {e}")
    finally:
        try:
            await websocket.close()
        except:
            pass