from pydantic import BaseModel, field_validator
from datetime import date, datetime, time
from typing import Optional
from app.status import normalize_appointment_status

# Base fields shared by all appointment schemas
class AppointmentBase(BaseModel):
    patient_id: Optional[int] = None
    hospital_id: Optional[int] = None
    doctor_id: Optional[int] = None
    doctor_name: Optional[str] = None
    hospital_name: Optional[str] = None
    appointment_date: Optional[date] = None
    appointment_time: Optional[time] = None
    status: Optional[str] = None
    reason: Optional[str] = None

    @field_validator("status", mode="before")
    @classmethod
    def normalize_status(cls, v):
        return normalize_appointment_status(v)

# Used for creating a NEW appointment (Fields are required here)
class AppointmentCreate(AppointmentBase):
    patient_id: int
    doctor_name: str # Overriding to make it required for creation
    appointment_date: date
    appointment_time: time
    status: Optional[str]= "Pending"
# PROFESSIONAL WAY: Used for PATCH updates (All fields optional)
class AppointmentUpdate(AppointmentBase):
    pass 

class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    hospital_id: int
    doctor_id: Optional[int] = None
    doctor_name: Optional[str] = None
    hospital_name: Optional[str] = None
    appointment_date: date
    appointment_time: Optional[time] = None
    status: str # Required in response so frontend always has a value
    reason: Optional[str] = None
    created_at: Optional[datetime] = None

    @field_validator("status", mode="before")
    @classmethod
    def normalize_status(cls, v):
        return normalize_appointment_status(v) or "Scheduled"

    @field_validator('appointment_time', mode='before')
    @classmethod
    def handle_null_time(cls, v):
        # If the time is "00:00:00" or None, return None so 
        # the frontend can explicitly see it's not set.
        if v is None or str(v) == "00:00:00":
            return None
        return v

    class Config:
        from_attributes = True


class PatientAppointmentRequest(BaseModel):
    """Specific schema for Patient Dashboard to avoid touching Receptionist logic"""
    hospital_id: int
    doctor_name: str
    appointment_date: date
    appointment_time: time
    reason: str

    class Config:
        from_attributes = True


class RescheduleRequestSchema(BaseModel):
    new_date: str
    new_time: str
    reason: Optional[str] = None

class FinalizeSchema(BaseModel):
    decision: str  # e.g., "approve_cancel" or "approve_reschedule"
    notes: str = None # Optional notes for the patient