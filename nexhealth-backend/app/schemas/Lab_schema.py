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
    test_results: Optional[dict] = None  # To show results in the UI
    collection_started_at: Optional[datetime] = None
    collected_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    report_file_url: Optional[str] = None
    report_generated_at: Optional[datetime] = None
    report_sent_at: Optional[datetime] = None
    report_delivery_status: Optional[str] = "Not Sent"
    notes: Optional[str] = None 
    result_summary: Optional[str] = None
    result_file_url: Optional[str] = None


class LabResultUpdate(BaseModel):
    """Data sent when finalizing a test in the Processing Unit"""
    test_results: dict  
    result_summary: Optional[str] = "Test completed successfully."
    # Ensure this field exists so Pydantic doesn't reject the incoming request
    status: Optional[str] = "Completed" 
    note: Optional[str] = None # Added because your frontend sends 'note'
    
    model_config = ConfigDict(from_attributes=True)

class LabCollectionUpdate(BaseModel):
    """Updated Schema to match your frontend payload"""
    sample_type: str
    quantity: str
    collection_method: str
    collection_site: str
    collected_at: datetime  # Ensure this matches your date string format
    status: str = "Processing" # Added to accept the status transition
    
    # Keep these if you still need them
    collected_by: Optional[int] = None 
    collection_notes: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

# --- NEW: Schema for Rejection (Handling errors) ---
class LabRejectionUpdate(BaseModel):
    rejection_reason: str # e.g., "Hemolyzed", "Insufficient Volume"
    technician_id: int

class LabReportUpdate(BaseModel):
    """Schema for updating report status and file URL"""
    report_file_url: Optional[str] = None
    report_delivery_status: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)