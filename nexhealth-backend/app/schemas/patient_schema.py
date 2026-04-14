from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, time

class PatientBase(BaseModel):
    abha_id: Optional[str] = Field(None, description="Linkage for ABHA ID")
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    hospital_id: int

    # Legacy optional fields kept for compatibility with existing routes.
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None

class PatientCreate(PatientBase):
    email: Optional[EmailStr] = None
    visit_type: Optional[str] = "New Patient"
    doctor_name: Optional[str] = "TBD"

class PatientResponse(PatientBase):
    id: int
    user_id: Optional[int] = None
    visit_type: Optional[str] = None
    doctor_name: Optional[str] = None
    status: Optional[str] = None
    created_at: datetime 

    class Config:
        from_attributes = True

class PatientInQueue(BaseModel):
    id: int
    first_name: str
    last_name: str
    gender: str

    class Config:
        from_attributes = True

# app/schemas/patient_schema.py

class DoctorQueueResponse(BaseModel):
    id: int 
    status: str
    appointment_time: Optional[time]
    priority: str = "Routine"
    patient: PatientInQueue 

    class Config:
        from_attributes = True