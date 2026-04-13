from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.session import get_db
from ..db import models
from ..schemas.auth_schema import HospitalCreate
router = APIRouter(prefix="/api/v1/superadmin", tags=["SuperAdmin"])

@router.get("/hospitals")
def get_all_hospitals(db: Session = Depends(get_db)):
    return db.query(models.Hospital).all()

@router.post("/hospitals/register")
def create_hospital(payload: HospitalCreate, db: Session = Depends(get_db)):
    
    existing = db.query(models.Hospital).filter(
        models.Hospital.hfr_id == payload.hfrId
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Hospital already registered")

    new_hosp = models.Hospital(
        name=payload.name,
        hfr_id=payload.hfrId,
        admin_email=payload.email,
        phone=payload.phone,
        category=payload.category,
        facility_type=payload.type,
        address=payload.address,
        city=payload.city,
        state=payload.state,
        bed_capacity=payload.bedCapacity
    )

    db.add(new_hosp)
    db.commit()
    db.refresh(new_hosp)

    return {"message": "Hospital created", "id": new_hosp.id}

@router.delete("/hospitals/{hosp_id}")
def delete_hospital(hosp_id: int, db: Session = Depends(get_db)):
    hospital = db.query(models.Hospital).filter(models.Hospital.id == hosp_id).first()

    if not hospital:
        raise HTTPException(status_code=404, detail="Not found")

    db.query(models.User).filter(models.User.hospital_id == hosp_id).delete()
    db.delete(hospital)
    db.commit()

    return {"message": "Hospital deleted"}

@router.put("/hospitals/{hosp_id}")
def update_hospital(hosp_id: int, payload: HospitalCreate, db: Session = Depends(get_db)):
    # 1. Find the hospital
    hospital = db.query(models.Hospital).filter(models.Hospital.id == hosp_id).first()

    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    # 2. Update the fields
    hospital.name = payload.name
    hospital.hfr_id = payload.hfrId
    hospital.admin_email = payload.email
    hospital.phone = payload.phone
    hospital.category = payload.category
    hospital.facility_type = payload.type
    hospital.address = payload.address
    hospital.city = payload.city
    hospital.state = payload.state
    hospital.bed_capacity = payload.bedCapacity

    # 3. Commit changes
    db.commit()
    db.refresh(hospital)

    return {"message": "Hospital updated successfully", "hospital": hospital.name}