from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.db.session import get_db 
from app.db import models
from app.schemas import Lab_schema as schemas 

router = APIRouter(
    prefix="/api/v1/lab",
    tags=["Laboratory"]
)

@router.get("/requests/pending/{hospital_id}", response_model=List[schemas.LabRequestResponse])
def get_pending_lab_requests(hospital_id: int, db: Session = Depends(get_db)):
    requests = db.query(models.LabRequest)\
        .options(
            joinedload(models.LabRequest.patient), 
            joinedload(models.LabRequest.doctor)
        )\
        .filter(
            models.LabRequest.hospital_id == hospital_id, 
            models.LabRequest.status == "Pending"
        )\
        .all()
    
    for r in requests:
        # These use the @property full_name from your models
        r.patient_name = r.patient.full_name if r.patient else "Unknown"
        r.doctor_name = r.doctor.full_name if r.doctor else "Unknown Staff"
        
        # FIX: Keep this as the integer primary key to avoid ValidationErrors
        r.doctor_id = r.doctor.id if r.doctor else 0
        
        # ADDITION: Use a separate field for the display ID (e.g., 'DOC-2026-012')
        # You will need to add 'staff_display_id' to your Pydantic schema
        r.staff_display_id = r.doctor.staff_id if r.doctor else "N/A"
        
    return requests

@router.put("/requests/{request_id}/accept")
def accept_test_request(request_id: int, db: Session = Depends(get_db)):
    db_req = db.query(models.LabRequest).filter(models.LabRequest.id == request_id).first()
    
    if not db_req:
        raise HTTPException(status_code=404, detail="Lab Request not found")
    
    db_req.status = "In-Progress"
    db.commit()
    
    return {"status": "success", "message": "Request moved to Sample Collection"}

@router.get("/requests/{request_id}", response_model=schemas.LabRequestResponse)
def get_request_details(request_id: int, db: Session = Depends(get_db)):
    db_req = db.query(models.LabRequest).options(
        joinedload(models.LabRequest.patient),
        joinedload(models.LabRequest.doctor)
    ).filter(models.LabRequest.id == request_id).first()
    
    if not db_req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    db_req.patient_name = db_req.patient.full_name if db_req.patient else "Unknown"
    db_req.doctor_name = db_req.doctor.full_name if db_req.doctor else "Unknown"
    db_req.staff_display_id = db_req.doctor.staff_id if db_req.doctor else "N/A"
    
    return db_req