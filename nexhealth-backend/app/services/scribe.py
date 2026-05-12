import os
import asyncio
import re
import datetime
from groq import Groq
from faster_whisper import WhisperModel
from dotenv import load_dotenv

load_dotenv()

# 1. Setup Whisper
# 'base' is good for speed; use 'small' or 'medium' for higher accuracy in medical terms
MODEL_SIZE = "base"
whisper_model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")

# 2. Setup Groq Client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def transcribe_audio(audio_path: str):
    """Converts audio into raw text using Faster-Whisper."""
    try:
        segments, _ = whisper_model.transcribe(audio_path, beam_size=5)
        return " ".join([segment.text for segment in segments])
    except Exception as e:
        print(f"Transcription Error: {e}")
        return ""

async def generate_medical_summary(transcript: str, max_retries: int = 2):
    """
    Uses Groq (Llama 3.1 8B) to generate a professional clinical report.
    Includes automated medical reasoning and suggested medications.
    """
    if not transcript.strip():
        return "No clear dialogue detected in the recording."

    # Professional Medical Prompt
    prompt = f"""
    Role: Senior Medical Scribe for NexHealth.
    Task: Generate a high-density, professional 'Consultation Report' from the transcript.
    
    Structure the report exactly with these Markdown headers:
    
    ### 🏥 CLINICAL SUMMARY (SOAP)
    **Subjective**: 
    - Chief Complaint: (Primary reason for visit)
    - HPI: (Brief narrative of symptoms, duration, and severity)
    
    **Objective**: 
    - Observations: (Physical signs or distress mentioned or observed)
    
    **Assessment**: 
    - Clinical Impression: (Potential diagnosis or clinical conclusion)
    
    ---
    ### 💊 AI-ASSISTED TREATMENT PLAN
    **Suggested Medications**: 
    - (Suggest specific medications, dosage, and duration based on standard protocols for the discussed symptoms)
    
    **Patient Advice**: 
    - (Lifestyle instructions or precautions given)
    
    **Follow-up**: 
    - (Recommended timeframe for the next review)

    ---
    **DISCLAIMER**: This report contains AI-generated clinical suggestions. The attending physician must verify, modify, and sign off on all details before finalization.
    
    Transcript: {transcript}
    """

    for attempt in range(max_retries):
        try:
            # Using temperature 0.0 for deterministic, factual output
            response = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {
                        "role": "system", 
                        "content": "You are a professional medical scribe. Your output is formal, clinical, and follows standard EMR documentation protocols."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.0, 
            )
            
            summary = response.choices[0].message.content

            # Enhanced Privacy Guardrails
            # Redacts Aadhaar (12 digits) and general sensitive ID patterns
            final_text = re.sub(r'\b\d{4}\s?\d{4}\s?\d{4}\b', '[ID Redacted]', summary)
            
            return final_text

        except Exception as e:
            error_str = str(e).upper()
            
            # Handling Groq Rate Limits (429)
            if "429" in error_str or "RATE_LIMIT" in error_str:
                if attempt < max_retries - 1:
                    await asyncio.sleep(2)
                    continue
                else:
                    return "AI Scribe (Groq) is currently busy. Please wait 10 seconds and try again."
            
            print(f"Groq API Error: {e}")
            return "AI Summarization failed. Please enter clinical notes manually."

    return "AI Summarization failed due to an unexpected error."