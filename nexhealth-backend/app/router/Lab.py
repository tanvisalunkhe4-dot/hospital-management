from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import date
from app.db.session import get_db 
from app.db import models
from app.schemas import Lab_schema as schemas
import uuid # For generating unique Accession Numbers
from datetime import datetime, timezone 
from fastapi import File, UploadFile, Form, Depends
import json
router = APIRouter(
    prefix="/api/v1/lab",
    tags=["Laboratory"]
)

# --- HELPER: Flattening Logic ---
def flatten_lab_data(r):
    """Reusable helper to map database relations to flat UI fields"""
    if r.patient:
        r.patient_name = f"{r.patient.first_name} {r.patient.last_name}"
        r.patient_gender = r.patient.gender or "N/A"
        if r.patient.date_of_birth:
            today = date.today()
            dob = r.patient.date_of_birth
            r.patient_age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        else:
            r.patient_age = 0
    
    if r.doctor:
        r.doctor_name = r.doctor.full_name or "Unknown Staff"
        r.staff_display_id = r.doctor.staff_id or "N/A"
        dept_obj = getattr(r.doctor, 'department', None)
        r.doctor_dept = getattr(dept_obj, 'name', "General Medicine")
    
    return r

@router.get("/requests/accepted/{hospital_id}", response_model=List[schemas.LabRequestResponse])
def get_accepted_lab_requests(hospital_id: int, db: Session = Depends(get_db)):
    """
    Fetches requests that have been accepted/handshaked by a technician
    but are still awaiting physical sample collection.
    """
    requests = db.query(models.LabRequest)\
        .options(
            joinedload(models.LabRequest.patient), 
            joinedload(models.LabRequest.doctor).joinedload(models.Staff.department)
        )\
        .filter(
            models.LabRequest.hospital_id == hospital_id,
            models.LabRequest.status == "Accepted"
        )\
        .all()
    
    return [flatten_lab_data(r) for r in requests]

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

@router.put("/requests/{request_id}/reject", response_model=schemas.LabRequestResponse)
def reject_test_request(request_id: int, db: Session = Depends(get_db)):
    """
    Updates the status of a pending requisition to 'Rejected'.
    Ensures safe operations by preventing modification of active flows.
    """
    db_req = db.query(models.LabRequest).options(
        joinedload(models.LabRequest.patient),
        joinedload(models.LabRequest.doctor).joinedload(models.Staff.department)
    ).filter(models.LabRequest.id == request_id).first()
    
    if not db_req:
        raise HTTPException(status_code=404, detail="Lab Request record not found")
        
    if db_req.status != "Pending":
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot reject request. Current process status is tracking as '{db_req.status}'."
        )
        
    db_req.status = "Rejected"
    
    try:
        db.commit()
        db.refresh(db_req)
        return flatten_lab_data(db_req)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error handling rejection record submission")


 
@router.get("/requests/collected/{hospital_id}", response_model=List[schemas.LabRequestResponse])
def get_collected_samples(hospital_id: int, db: Session = Depends(get_db)):
    """Fetches samples ready for result entry"""
    requests = db.query(models.LabRequest)\
        .options(joinedload(models.LabRequest.patient), joinedload(models.LabRequest.doctor))\
        .filter(models.LabRequest.hospital_id == hospital_id, models.LabRequest.status == "Collected").all()
    return [flatten_lab_data(r) for r in requests]

@router.put("/requests/{request_id}/complete")
async def complete_lab_test(
    request_id: int,
    # Receive metadata as a JSON string (requires form-data from frontend)
    result_data: str = Form(...), 
    # Receive the file separately as an UploadFile
    file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    db_req = db.query(models.LabRequest).filter(models.LabRequest.id == request_id).first()
    
    if not db_req:
        raise HTTPException(status_code=404, detail="Lab Request not found")

    # 1. Parse the JSON string from Form data
    try:
        data = json.loads(result_data)
        lab_result_update = schemas.LabResultUpdate(**data)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON format in result_data")

    # 2. Update status and data
    db_req.status = "Completed"
    
    if not lab_result_update.test_results:
        raise HTTPException(status_code=400, detail="Test results cannot be empty")
        
    db_req.test_results = lab_result_update.test_results
    db_req.result_summary = lab_result_update.result_summary or "Verified by Lab Staff"
    db_req.completed_at = datetime.now(timezone.utc)
    
    # 3. Handle file upload (if applicable)
    if file:
        # Example: Save file to local directory or S3
        # file_path = f"uploads/{request_id}_{file.filename}"
        # with open(file_path, "wb") as buffer:
        #     buffer.write(await file.read())
        # db_req.file_url = file_path
        pass

    try:
        db.commit()
        db.refresh(db_req)
        return {"status": "success", "message": "Results finalized", "request_id": request_id}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to save results to database")
    

@router.put("/requests/{request_id}/collect", response_model=schemas.LabRequestResponse)
def mark_sample_collected(
    request_id: int, 
    collection_data: schemas.LabCollectionUpdate, 
    db: Session = Depends(get_db)
):
    """
    Finalizes the physical collection. 
    Uses existing schemas to ensure compatibility with other router endpoints.
    """
    # 1. Fetch record using the same logic as other endpoints
    db_req = db.query(models.LabRequest).filter(models.LabRequest.id == request_id).first()
    
    if not db_req:
        raise HTTPException(status_code=404, detail="Lab Request not found")

    # 2. Update status and timestamp
    # We use timezone.utc to ensure consistency with your other date-based logic
    db_req.status = "Collected"
    db_req.collected_at = datetime.now(timezone.utc)
    
    # 3. Update notes safely
    # This only maps fields that exist in your schema, ensuring no database crashes
    db_req.notes = collection_data.collection_notes 
    
    try:
        db.commit()
        db.refresh(db_req)
        # Using the same flattening helper ensures the returned object 
        # matches the expected response_model structure
        return flatten_lab_data(db_req)
    except Exception as e:
        db.rollback()
        # Log the actual error for debugging, but return a clean HTTP error
        print(f"Error during collection update: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to update collection status"
        )

@router.get("/requests/{request_id}/label", response_model=schemas.LabRequestResponse)
def get_label_data(request_id: int, db: Session = Depends(get_db)):
    """
    Provides the verified metadata for printing physical specimen labels.
    """
    db_req = db.query(models.LabRequest)\
        .options(joinedload(models.LabRequest.patient))\
        .filter(models.LabRequest.id == request_id).first()
        
    if not db_req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if not db_req.accession_number:
        raise HTTPException(status_code=400, detail="Accession number not generated. Accept the request first.")

    return flatten_lab_data(db_req)

@router.put("/requests/{request_id}/draft")
def save_lab_test_draft(
    request_id: int, 
    draft_data: schemas.LabResultUpdate, 
    db: Session = Depends(get_db)
):
    """
    Saves partial results to the database without changing the status to 'Completed'.
    """
    db_req = db.query(models.LabRequest).filter(models.LabRequest.id == request_id).first()
    
    if not db_req:
        raise HTTPException(status_code=404, detail="Lab Request not found")

    # Update only the results data
    if draft_data.test_results:
        db_req.test_results = draft_data.test_results
    
    # We do NOT change db_req.status here. It stays as 'Collected'
    
    try:
        db.commit()
        db.refresh(db_req)
        return {"status": "success", "message": "Draft saved", "request_id": request_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to save draft")

@router.put("/requests/{request_id}/verify")
def verify_test_results(request_id: int, db: Session = Depends(get_db)):
    db_req = db.query(models.LabRequest).filter(models.LabRequest.id == request_id).first()
    if not db_req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Transition to Verified
    db_req.status = "Verified"
    db_req.verified_at = datetime.now(timezone.utc)
    
    db.commit()
    return {"status": "success", "message": "Test results verified by supervisor."}


@router.get("/reports/list", response_model=List[schemas.LabRequestResponse])
def get_completed_reports(db: Session = Depends(get_db)):
    # Also, remember to flatten the data so it matches the response schema fields
    requests = db.query(models.LabRequest)\
        .filter(models.LabRequest.status.in_(["Completed", "Verified"]))\
        .all()
    return [flatten_lab_data(r) for r in requests]