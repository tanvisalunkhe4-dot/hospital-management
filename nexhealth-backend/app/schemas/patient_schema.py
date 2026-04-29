from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, time, date


class PatientBase(BaseModel):
    # Identity & ABDM
    abha_id: Optional[str] = None
    id_type: Optional[str] = None
    id_number: Optional[str] = None
    
    # Demographics
    date_of_birth: Optional[date] = None # Using str to match HTML date input
    gender: Optional[str] = None
    address: Optional[str] = None
    
    # Clinical
    blood_group: Optional[str] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None

    occupation: Optional[str] = None
    marital_status: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_relation: Optional[str] = None
    insurance_provider: Optional[str] = None
    policy_number: Optional[str] = None
   

    # Legacy fields
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    hospital_id: Optional[int] = None

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

class PatientProfile(PatientBase):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        from_attributes = True


class PatientUpdate(PatientBase):
       full_name: Optional[str] = None
    

class PatientDashboardSummary(BaseModel):
    next_appointment: Optional[datetime] = None
    blood_group: Optional[str] = "Unknown"
    pending_reports: int = 0
    last_visit: Optional[datetime] = None
    abha_linked: bool = False
    uhid: str


class PatientInQueue(BaseModel):
    id: int
    first_name: str
    last_name: str
    gender: str

    class Config:
        from_attributes = True


class DoctorQueueResponse(BaseModel):
    id: int
    status: str
    appointment_time: Optional[time]
    priority: str = "Routine"
    patient: PatientInQueue

    class Config:
        from_attributes = True