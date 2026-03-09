from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.organization import Organization
from app.schemas.organization import OrganizationCreate, OrganizationOut

router = APIRouter(prefix="/organizations", tags=["Organizations"])

@router.post("/", response_model=OrganizationOut)
def create_hospital(org: OrganizationCreate, db: Session = Depends(get_db)):
    # Check if GSTIN exists if provided
    if org.gstin:
        existing = db.query(Organization).filter(Organization.gstin == org.gstin).first()
        if existing:
            raise HTTPException(status_code=400, detail="GSTIN already registered")
    
    new_org = Organization(**org.model_dump())
    db.add(new_org)
    db.commit()
    db.refresh(new_org)
    return new_org