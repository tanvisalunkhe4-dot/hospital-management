from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime
# --- ADD THIS CLASS ---
class HospitalCreate(BaseModel):
    name: str
    hfrId: str
    email: EmailStr
    phone: str
    category: str
    type: str
    address: str
    city: str
    state: str
    bedCapacity: int

# --- YOUR EXISTING CLASSES ---
class SignupRequest(BaseModel):
    role: str
    identifier: str
    password: str
    hospital_id: Optional[str] = None

class LoginRequest(BaseModel):
    role: str
    identifier: str # This is the Email
    password: str
    hospital_id: Optional[str] = None# Changed from hospitalId to hospital_id and str to int

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class StaffBase(BaseModel):
    full_name: str
    email: EmailStr
    role: str
    staff_id: str

class StaffCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str  # Doctor, Nurse, Receptionist, etc.
    dept_id: int
    hospital_id: int
    salary: float
    qualification: str
    
    # Specialized Metadata (Optional depending on role)
    specialization: Optional[str] = None
    license_no: Optional[str] = None
    shift_type: Optional[str] = "Day"
    ward_no: Optional[str] = None
    is_hod: Optional[bool] = False
    desk_location: Optional[str] = None
    lab_section: Optional[str] = None
    pharmacy_license: Optional[str] = None

    class Config:
        from_attributes = True

class StaffUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    staff_id: Optional[str] = None 
    dept_id: Optional[int] = None
    specialization: Optional[str] = None
    license_no: Optional[str] = None
    is_hod: Optional[bool] = None
    shift_type: Optional[str] = None
    ward_no: Optional[str] = None
    desk_location: Optional[str] = None
    lab_section: Optional[str] = None
    pharmacy_license: Optional[str] = None

# app/schemas/auth_schema.py
class StaffResponse(BaseModel):
    id: int
    full_name: Optional[str] = "Unknown"
    email: str
    role: str
    staff_id: str
    hospital_id: int   
    dept_id: int
    is_active: bool = True

    class Config:
        from_attributes = True
        
class DepartmentBase(BaseModel):
    name: str
    hospital_id: int
    dept_code: Optional[str] = None
    head_of_dept: Optional[str] = None
    location: Optional[str] = None
    contact_number: Optional[str] = None
    dept_type: str = "Clinical"

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentOut(BaseModel):
    id: int
    name: str
    dept_code: Optional[str] = None
    head_of_dept: Optional[str] = None
    location: Optional[str] = None
    contact_number: Optional[str] = None
    dept_type: str
    hospital_id: int

    class Config:
        from_attributes = True # T

# --- ADD THESE FOR ANALYTICS ---
class RevenueTrend(BaseModel):
    date: str
    amount: float

class AnalyticsOut(BaseModel):
    total_revenue: float
    active_patients: int
    occupancy_rate: float
    revenue_trend: list[RevenueTrend]
    department_distribution: list[dict]

    class Config:
        from_attributes = True

class SecurityUpdateSchema(BaseModel):
    mfa_enabled: Optional[bool] = None
    ip_whitelist_enabled: Optional[bool] = None
    session_timeout: Optional[int] = None

class PatientBase(BaseModel):
    abha_id: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    hospital_id: Optional[int] = None

class PatientProfile(PatientBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
class PatientUpdate(BaseModel):
    abha_id: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    
class PatientDashboardSummary(BaseModel):
    next_appointment: Optional[datetime] = None
    blood_group: Optional[str] = "Unknown"
    pending_reports: int = 0
    last_visit: Optional[datetime] = None
    abha_linked: bool = False
    uhid: str

# --- 4. CLINICAL DATA & ANALYTICS ---

class AppointmentRead(BaseModel):
    id: int
    doctor_name: Optional[str] = None
    hospital_name: Optional[str] = None
    appointment_date: datetime
    status: str 
    reason: Optional[str] = None

    class Config:
        from_attributes = True

class MedicalRecordRead(BaseModel):
    id: int
    record_type: Optional[str] = None
    hospital_name: Optional[str] = None
    issued_date: datetime
    file_url: Optional[str] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True

class AnalyticsOut(BaseModel):
    total_revenue: float
    active_patients: int
    occupancy_rate: float
    revenue_trend: List[dict]
    department_distribution: List[dict]

    class Config:
        from_attributes = True