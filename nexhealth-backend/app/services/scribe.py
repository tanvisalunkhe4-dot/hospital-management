import os
import asyncio
import re
from groq import Groq
from faster_whisper import WhisperModel
from dotenv import load_dotenv

load_dotenv()

# 1. Setup Whisper
MODEL_SIZE = "base"
whisper_model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")

# 2. Setup Groq Client
# Groq provides extremely high-speed inference with higher rate limits for free-tier users
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
    Uses Groq (Llama 3.1 8B) to structure transcripts.
    Groq is significantly faster than Gemini and less prone to 429 errors on free tiers.
    """
    if not transcript.strip():
        return "No clear dialogue detected in the recording."

    prompt = f"""
    Role: Professional Medical Scribe for NexHealth.
    Task: Convert the doctor-patient transcript below into a structured SOAP Clinical Note.
    
    Format Requirements:
    ### Chief Complaint
    ### History of Present Illness (HPI)
    ### Vitals/Clinical Findings
    ### Assessment & Plan
    
    Constraints:
    - Clinical, professional tone.
    - REDACT ALL SENSITIVE IDs: If any government IDs are mentioned, replace them with [Redacted].
    
    Transcript: {transcript}
    """

    for attempt in range(max_retries):
        try:
            # Using llama-3.1-8b-instant for sub-second responses
            response = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": "You are a helpful medical scribe."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1, # Lower temperature for factual medical consistency
            )
            
            summary = response.choices[0].message.content

            # Secondary Regex Guardrail for Aadhaar patterns
            final_text = re.sub(r'\b\d{4}\s?\d{4}\s?\d{4}\b', '[Aadhaar Redacted]', summary)
            return final_text

        except Exception as e:
            error_str = str(e).upper()
            
            # Handling Groq Rate Limits (429)
            if "429" in error_str or "RATE_LIMIT" in error_str:
                if attempt < max_retries - 1:
                    await asyncio.sleep(2) # Groq is fast, usually a short wait is enough
                    continue
                else:
                    return "AI Scribe (Groq) is currently busy. Please try again in a few seconds."
            
            print(f"Groq API Error: {e}")
            return "AI Summarization failed. Please enter notes manually."

    return "AI Summarization failed due to unexpected error."