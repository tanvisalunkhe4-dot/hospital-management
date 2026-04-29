from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, time


class PatientBase(BaseModel):
    abha_id: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    hospital_id: Optional[int] = None

    # Legacy optional fields
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


class PatientProfile(PatientBase):
    id: int
    user_id: int
    phone_secondary: Optional[str] = None
    email_professional: Optional[str] = None
    designation: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PatientUpdate(BaseModel):
    abha_id: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None

    full_name: Optional[str] = None
    phone_secondary: Optional[str] = None
    email_professional: Optional[str] = None
    designation: Optional[str] = None

    first_name: Optional[str] = None
    last_name: Optional[str] = None
    address: Optional[str] = None


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