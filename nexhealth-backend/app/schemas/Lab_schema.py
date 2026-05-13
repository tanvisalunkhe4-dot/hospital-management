from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class LabRequestBase(BaseModel):
    hospital_id: int
    patient_id: int
    appointment_id: Optional[int] = None
    doctor_id: int
    test_name: str
    # Make this Optional so creation doesn't fail if it's generated server-side
    staff_display_id: Optional[str] = "N/A" 
    category: Optional[str] = None
    priority: str = "Normal"
    price_at_request: float = 0.0
    
    # Use the Pydantic v2 way for the base as well
    model_config = ConfigDict(from_attributes=True)

class LabRequestCreate(LabRequestBase):
    """Schema for creating a new lab request (Doctor Side)"""
    pass

class LabRequestResponse(LabRequestBase):
    """Schema for returning lab request data (Lab Dashboard Side)"""
    id: int
    status: str
    requested_at: datetime
    completed_at: Optional[datetime] = None
    
    # These fields are populated by the mapping logic in Lab.py
    patient_name: Optional[str] = "Unknown"
    doctor_name: Optional[str] = "Unknown Staff"
    
    result_summary: Optional[str] = None
    result_file_url: Optional[str] = None

class LabResultSubmit(BaseModel):
    """Schema for submitting test results"""
    result_summary: str
    result_file_url: Optional[str] = None
    status: str = "Completed"