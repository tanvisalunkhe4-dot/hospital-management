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
    id: int
    status: str
    requested_at: datetime
    completed_at: Optional[datetime] = None
    
    # Live data fields for the Professional Modal
    patient_name: Optional[str] = "Unknown"
    patient_age: Optional[int] = 0        # Add this
    patient_gender: Optional[str] = "N/A"  # Add this
    doctor_name: Optional[str] = "Unknown Staff"
    doctor_dept: Optional[str] = "General" # Add this
    
    # Ensure this matches the field name used in the doctor's prescription
    notes: Optional[str] = None 
    sample_type: Optional[str] = "TBD"
    
    result_summary: Optional[str] = None
    result_file_url: Optional[str] = None
class LabResultSubmit(BaseModel):
    """Schema for submitting test results"""
    result_summary: str
    result_file_url: Optional[str] = None
    status: str = "Completed"