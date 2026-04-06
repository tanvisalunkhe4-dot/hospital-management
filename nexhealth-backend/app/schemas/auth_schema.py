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
    identifier: str # This is the Email
    password: str
    hospital_id: Optional[int] = None # Changed from hospitalId to hospital_id and str to int

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict