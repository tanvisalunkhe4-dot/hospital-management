import os
import asyncio
import re
from google import genai
from faster_whisper import WhisperModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# 1. Setup Whisper (Global initialization)
# Using 'base' for a balance of speed and accuracy on CPU
MODEL_SIZE = "base"
whisper_model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")

# 2. Setup New Gemini Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def transcribe_audio(audio_path: str):
    """Converts recorded doctor-patient audio into raw text using Faster-Whisper."""
    try:
        segments, _ = whisper_model.transcribe(audio_path, beam_size=5)
        return " ".join([segment.text for segment in segments])
    except Exception as e:
        print(f"Transcription Error: {e}")
        return ""

async def generate_medical_summary(transcript: str, max_retries: int = 3):
    """
    Uses Gemini 2.0 Flash to structure messy transcripts into clinical notes.
    Includes retry logic to handle 429 Rate Limit errors common in the Free Tier.
    """
    if not transcript.strip():
        return "No clear dialogue detected in the recording."

    prompt = f"""
    Role: Professional Medical Scribe for NexHealth.
    Task: Convert the messy doctor-patient transcript below into a structured Clinical Note.
    
    Format Requirements:
    ### Chief Complaint
    ### History of Present Illness (HPI)
    ### Vitals/Clinical Findings
    ### Assessment & Plan
    
    Constraints:
    - Maintain a professional, clinical tone.
    - REDACT ALL SENSITIVE IDs: If any Aadhaar digits or government IDs are mentioned, replace them with [Aadhaar Redacted].
    
    Transcript: {transcript}
    """

    for attempt in range(max_retries):
        try:
            # Using Gemini 2.0 Flash for improved reasoning and speed
            response = client.models.generate_content(
                model="gemini-2.0-flash", 
                contents=prompt
            )
            
            # Additional safety: Local Regex redaction for Aadhaar patterns (12 digits)
            # This serves as a secondary guardrail if the AI misses any digits.
            final_text = re.sub(r'\b\d{4}\s?\d{4}\s?\d{4}\b', '[Aadhaar Redacted]', response.text)
            return final_text

        except Exception as e:
            error_str = str(e).upper()
            
            # Check for Rate Limit (429) to apply backoff
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 5  # Incremental wait: 5s, 10s...
                    print(f"Rate limit hit. Retrying in {wait_time}s... (Attempt {attempt + 1}/{max_retries})")
                    await asyncio.sleep(wait_time)
                    continue
                else:
                    return "AI Scribe is currently busy (Rate Limit). Please save the draft and try again in a minute."
            
            # Handle other SDK Errors (like 404 or Authentication)
            print(f"GenAI SDK Error: {e}")
            return "AI Summarization failed. Please review the raw transcript or manually enter notes."

    return "AI Summarization failed due to unexpected error."