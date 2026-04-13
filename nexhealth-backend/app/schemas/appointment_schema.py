from pydantic import BaseModel
from datetime import date, time
from typing import Optional

# Base fields shared by all appointment schemas
class AppointmentBase(BaseModel):
    doctor_name: Optional[str] = None
    appointment_date: Optional[date] = None
    appointment_time: Optional[time] = None
    reason: Optional[str] = None

# Used for creating a NEW appointment (Fields are required here)
class AppointmentCreate(AppointmentBase):
    patient_id: int
    doctor_name: str # Overriding to make it required for creation
    appointment_date: date
    appointment_time: time

# PROFESSIONAL WAY: Used for PATCH updates (All fields optional)
class AppointmentUpdate(AppointmentBase):
    pass 

class AppointmentResponse(AppointmentCreate):
    id: int
    status: str
    hospital_id: int
    class Config:
        from_attributes = True