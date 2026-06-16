import os
import asyncio
import re
import datetime

from groq import Groq
from faster_whisper import WhisperModel
from dotenv import load_dotenv
import time
import traceback
load_dotenv()

# 1. Setup Whisper
# 'base' is good for speed; use 'small' or 'medium' for higher accuracy in medical terms
MODEL_SIZE = "small"
whisper_model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")

# 2. Setup Groq Client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def transcribe_audio(audio_path: str):
    """Converts audio into raw text using Faster-Whisper."""
    try:
        segments, _ = whisper_model.transcribe(audio_path, beam_size=1,vad_filter=True,language="en")
        return " ".join([segment.text for segment in segments])
    except Exception as e:
        print(f"Transcription Error: {e}")
        return ""
async def stream_transcription(audio_path, websocket):
    try:
        segments, _ = whisper_model.transcribe(
            audio_path,
            beam_size=1,
            vad_filter=True,
            language="en"
        )

        full_text = ""

        for segment in segments:

            text = segment.text.strip()

            if not text:
                continue

            full_text += " " + text

            await websocket.send_json({
                "type": "partial_transcript",
                "text": full_text.strip()
            })

            await asyncio.sleep(0.03)

        await websocket.send_json({
            "type": "final_transcript",
            "text": full_text.strip()
        })

    except Exception as e:
        print("Streaming Error:", e)
    


async def generate_medical_summary(transcript: str, max_retries: int = 3):
    print("=" * 60)
    print("TRANSCRIPT LENGTH:", len(transcript))
    print("TRANSCRIPT PREVIEW:")
    print(transcript[:500])
    print("=" * 60)
    """
    Uses Groq (Llama 3.1 8B) to generate a professional clinical report.
    Includes automated medical reasoning and suggested medications.
    """
    
    if not transcript.strip():
        return "No clear dialogue detected in the recording."

    transcript = re.sub(r'\b(uh|umm|hmm)\b', '', transcript, flags=re.IGNORECASE)

    if len(transcript) > 3000:
      transcript = transcript[:3000]
      print("Transcript truncated to 3000 chars")

      print(f"Transcript size after cleanup: {len(transcript)} chars")
    # Professional Medical Prompt
    prompt = f"""
You are a professional medical scribe.

Create a SOAP note from the consultation transcript.

Format:

### CLINICAL SUMMARY (SOAP)

Subjective:
- Chief Complaint
- History of Present Illness

Objective:
- Findings or observations mentioned

Assessment:
- Likely diagnosis or clinical impression

Plan:
- Suggested medications (only if clearly supported)
- Patient advice
- Follow-up recommendations

If information is missing, write "Not specified".

Transcript:
{transcript}
"""

    for attempt in range(max_retries):
        try:
            start_time = time.time()
            print("Calling Groq...")
            print(f"Transcript chars: {len(transcript)}")
            print(f"Prompt chars: {len(prompt)}")
            # Using temperature 0.0 for deterministic, factual output
            response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            max_tokens=600,
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
            print(
    f"Groq completed in {time.time() - start_time:.2f} seconds"
)
            # Enhanced Privacy Guardrails
            # Redacts Aadhaar (12 digits) and general sensitive ID patterns
            final_text = re.sub(r'\b\d{4}\s?\d{4}\s?\d{4}\b', '[ID Redacted]', summary)
            
            return final_text

        except Exception as e:
            error_str = str(e).upper()
            
            # Handling Groq Rate Limits (429)
            if "429" in error_str or "RATE_LIMIT" in error_str:
                if attempt < max_retries - 1:
                    await asyncio.sleep(1.5 * (attempt + 1))
                    continue
                else:
                    return "AI Scribe (Groq) is currently busy. Please wait 10 seconds and try again."
            
            print("GROQ ERROR")
            print(str(e))
            traceback.print_exc()
            return "AI Summarization failed. Please enter clinical notes manually."

    return "AI Summarization failed due to an unexpected error."