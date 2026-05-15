from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import date
from app.db.session import get_db 
from app.db import models
from app.schemas import Lab_schema as schemas
import uuid # For generating unique Accession Numbers
from datetime import datetime 

router = APIRouter(
    prefix="/api/v1/lab",
    tags=["Laboratory"]
)



@router.get("/requests/pending/{hospital_id}", response_model=List[schemas.LabRequestResponse])
def get_pending_lab_requests(hospital_id: int, db: Session = Depends(get_db)):
    """
    Fetches all pending lab requests for a specific hospital with 
    flattened patient and doctor metadata for the UI.
    """
    requests = db.query(models.LabRequest)\
        .options(
            joinedload(models.LabRequest.patient), 
            joinedload(models.LabRequest.doctor).joinedload(models.Staff.department)
        )\
        .filter(
            models.LabRequest.hospital_id == hospital_id,
            models.LabRequest.status == "Pending"
        )\
        .all()
    
    for r in requests:
        # --- Mapping Patient Data ---
        if r.patient:
            r.patient_name = f"{r.patient.first_name} {r.patient.last_name}"
            r.patient_gender = r.patient.gender or "N/A"
            
            # Safe Age Calculation
            if r.patient.date_of_birth:
                try:
                    today = date.today()
                    dob = r.patient.date_of_birth
                    # Handle both datetime and date objects from DB
                    r.patient_age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
                except Exception:
                    r.patient_age = 0
            else:
                r.patient_age = 0
        else:
            r.patient_name = "Unknown"
            r.patient_age = 0
            r.patient_gender = "N/A"
        
        # --- Mapping Doctor & Department Data ---
        if r.doctor:
            r.doctor_name = r.doctor.full_name or "Unknown Staff"
            r.staff_display_id = r.doctor.staff_id or "N/A"
            
            # The Fix: Explicitly extract the name string from the Department object
            if r.doctor.department and hasattr(r.doctor.department, 'name'):
                r.doctor_dept = str(r.doctor.department.name)
            else:
                r.doctor_dept = "General Medicine"
        else:
            r.doctor_name = "Unknown Staff"
            r.staff_display_id = "N/A"
            r.doctor_dept = "General Medicine"
            
    return requests




@router.get("/requests/{request_id}", response_model=schemas.LabRequestResponse)
def get_request_details(request_id: int, db: Session = Depends(get_db)):
    db_req = db.query(models.LabRequest).options(
        joinedload(models.LabRequest.patient),
        joinedload(models.LabRequest.doctor).joinedload(models.Staff.department)
    ).filter(models.LabRequest.id == request_id).first()
    
    if not db_req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    if db_req.patient:
        db_req.patient_name = db_req.patient.full_name
        db_req.patient_gender = db_req.patient.gender
        if db_req.patient.date_of_birth:
            today = date.today()
            dob = db_req.patient.date_of_birth
            db_req.patient_age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        else:
            db_req.patient_age = 0
    
    if db_req.doctor:
        db_req.doctor_name = db_req.doctor.full_name
        db_req.staff_display_id = db_req.doctor.staff_id
        
        # FIX: Get the department NAME string here too
        dept_obj = getattr(db_req.doctor, 'department', None)
        if dept_obj and hasattr(dept_obj, 'name'):
            db_req.doctor_dept = dept_obj.name
        else:
            db_req.doctor_dept = "General Medicine"
            
    return db_req


@router.put("/requests/{request_id}/accept", response_model=schemas.LabRequestResponse)
def accept_test_request(
    request_id: int, 
    # Add a simple schema for confirmation (sample_type)
    confirmation: schemas.LabAcceptanceUpdate, 
    db: Session = Depends(get_db)
):
    """
    Initiates the Clinical Chain of Custody.
    Updates status to 'In-Progress', generates an Accession Number, 
    and confirms the sample type for labeling.
    """
    db_req = db.query(models.LabRequest).filter(models.LabRequest.id == request_id).first()
    
    if not db_req:
        raise HTTPException(status_code=404, detail="Lab Request not found")
    
    if db_req.status != "Pending":
        raise HTTPException(status_code=400, detail="Request is already being processed")

    # 1. Update Status & Chain of Custody
    db_req.status = "Accepted" 
    
    # 2. Generate Unique Accession Number for Barcoding
    # Format: ACC-YYYYMMDD-HEX (Professional LIS Standard)
    date_str = datetime.now().strftime("%Y%m%d")
    unique_suffix = uuid.uuid4().hex[:4].upper()
    db_req.accession_number = f"ACC-{date_str}-{unique_suffix}"
    
    # 3. Capture Clinical Metadata from the Technician
    db_req.sample_type = confirmation.sample_type
    db_req.collection_started_at = datetime.now() # The "Handshake" timestamp
    
    try:
        db.commit()
        db.refresh(db_req)
        return db_req
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error during acceptance")