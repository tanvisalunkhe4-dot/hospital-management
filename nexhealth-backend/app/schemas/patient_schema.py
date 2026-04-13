from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date, datetime, time 

class PatientBase(BaseModel):
    first_name: str
    last_name: str
    phone_number: str
    date_of_birth: date
    gender: str
    address: Optional[str] = None
    abha_id: Optional[str] = Field(None, description="Linkage for ABHA ID")

class PatientCreate(PatientBase):
    email: EmailStr
    hospital_id: int  # Must be int to match the database
    visit_type: Optional[str] = "New Patient"
    doctor_name: Optional[str] = "TBD"

class PatientResponse(PatientBase):
    id: int
    visit_type: str
    doctor_name: str
    status: str
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