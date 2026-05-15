from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class LabRequestBase(BaseModel):
    hospital_id: int
    patient_id: int
    appointment_id: Optional[int] = None
    doctor_id: int
    test_name: str
    staff_display_id: Optional[str] = "N/A" 
    category: Optional[str] = None
    priority: str = "Normal"
    price_at_request: float = 0.0
    
    model_config = ConfigDict(from_attributes=True)

class LabRequestCreate(LabRequestBase):
    """Schema for creating a new lab request (Doctor Side)"""
    pass

# --- NEW: Schema for the "Handshake" (Acceptance) ---
class LabAcceptanceUpdate(BaseModel):
    """Data sent by technician when clicking 'Accept & Start Collection'"""
    sample_type: str  # e.g., "Venous Blood", "Urine", "Swab"
    # Optionally add collection_notes if the tech needs to record difficulty

class LabRequestResponse(LabRequestBase):
    id: int
    status: str
    requested_at: datetime
    completed_at: Optional[datetime] = None
    
    # Live data fields for the Professional Modal
    patient_name: Optional[str] = "Unknown"
    patient_age: Optional[int] = 0        
    patient_gender: Optional[str] = "N/A"  
    doctor_name: Optional[str] = "Unknown Staff"
    doctor_dept: Optional[str] = "General" 
    
    # --- Lifecycle & Chain of Custody Fields ---
    accession_number: Optional[str] = None # Unique ID for Barcode/Physical Label
    sample_type: Optional[str] = "TBD"      # Confirmed during acceptance
    collection_started_at: Optional[datetime] = None # The "Handshake" timestamp
    
    notes: Optional[str] = None 
    result_summary: Optional[str] = None
    result_file_url: Optional[str] = None

class LabResultSubmit(BaseModel):
    """Schema for submitting final test results"""
    result_summary: str
    result_file_url: Optional[str] = None
    status: str = "Completed"