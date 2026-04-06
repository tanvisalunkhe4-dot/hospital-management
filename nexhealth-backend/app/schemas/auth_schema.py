from pydantic import BaseModel, EmailStr
from typing import Optional
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
    identifier: str
    password: str
    hospitalId: Optional[str] = None

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

    class Config:
        from_attributes = True
class StaffUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    staff_id: Optional[str] = None
# app/schemas/auth_schema.py
class StaffResponse(BaseModel):
    id: int
    full_name: Optional[str] = "Unknown"
    email: str
    role: str
    staff_id: str
    hospital_id: int   # ✅ ADD THIS
    is_active: bool = True

    class Config:
        from_attributes = True
class DepartmentBase(BaseModel):
    name: str
    hospital_id: int
    dept_code: Optional[str] = None
    location: Optional[str] = None
    contact_number: Optional[str] = None
    dept_type: str = "Clinical"

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentOut(DepartmentBase):
    id: int
    class Config:
        from_attributes = True