from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..db.session import get_db
from ..db import models
from ..schemas.auth_schema import StaffCreate, StaffResponse, StaffUpdate
from ..utils import pwd_context # Ensure this import exists for hashing

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])

# --- DEPARTMENT ENDPOINTS ---

@router.get("/departments/{hospital_id}")
def get_departments(hospital_id: int, db: Session = Depends(get_db)):
    departments = db.query(models.Department).filter(
        models.Department.hospital_id == hospital_id
    ).all()
    return departments

@router.post("/departments", status_code=status.HTTP_201_CREATED)
def create_department(name: str, hospital_id: int, db: Session = Depends(get_db)):
    new_dept = models.Department(
        name=name, 
        hospital_id=hospital_id
    )
    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)
    return {"message": "Department created", "id": new_dept.id}


# --- STAFF MANAGEMENT ENDPOINTS ---
@router.post("/staff/register")
def register_staff(data: StaffCreate, db: Session = Depends(get_db)):
    # 1. HASH THE PASSWORD FIRST
    # This must be inside the function to use 'data.password'
    hashed_pwd = pwd_context.hash(data.password) 

    # 2. GENERATE ROLE-BASED ID
    role_prefixes = {"Doctor": "DOC", "Nurse": "NUR", "Receptionist": "REC"}
    prefix = role_prefixes.get(data.role, "STF")
    
    count = db.query(models.Staff).filter(models.Staff.role == data.role).count()
    generated_id = f"{prefix}-2026-{(count + 1):03d}"

    # 3. SAVE TO PRIMARY STAFF TABLE
    new_staff = models.Staff(
        staff_id=generated_id,
        full_name=data.full_name,
        email=data.email,
        hashed_password=hashed_pwd, 
        role=data.role,
        dept_id=data.dept_id,
        hospital_id=data.hospital_id,
        salary=data.salary,
        qualification=data.qualification
    )
    db.add(new_staff)
    db.commit()
    db.refresh(new_staff)

    # 4. SAVE TO SPECIALIZED TABLE
    if data.role == "Doctor":
        new_doc = models.Doctor(
            staff_ref_id=new_staff.id, 
            specialization=data.specialization,
            license_no=data.license_no,
            is_hod=data.is_hod
        )
        db.add(new_doc)
    
    elif data.role == "Nurse":
        new_nurse = models.Nurse(
            staff_ref_id=new_staff.id,
            shift_type=data.shift_type,
            ward_no=data.ward_no
        )
        db.add(new_nurse)

    db.commit()
    return {"message": "Staff Node Online", "staff_id": generated_id}


@router.get("/staff/{hospital_id}", response_model=List[StaffResponse])
def get_staff_list(hospital_id: int, db: Session = Depends(get_db)):
    # Ensure this is querying models.Staff, not models.User
    return db.query(models.Staff).filter(models.Staff.hospital_id == hospital_id).all()

@router.put("/staff/{staff_id}")
def update_staff(staff_id: int, payload: StaffUpdate, db: Session = Depends(get_db)):
    staff_query = db.query(models.Staff).filter(models.Staff.id == staff_id)
    staff = staff_query.first()

    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")

    # Update basic staff info
    update_data = payload.dict(exclude_unset=True)
    staff_query.update(update_data)
    
    db.commit()
    return {"message": "Staff record synchronized"}


@router.delete("/staff/{staff_id}") # Changed parameter name for clarity
def remove_staff(staff_id: int, db: Session = Depends(get_db)):
    """
    Decommissions a staff node from the active registry.
    """
    # Change models.User to models.Staff
    staff_member = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    
    if not staff_member:
        raise HTTPException(status_code=404, detail="Staff member not found")
    
    db.delete(staff_member)
    db.commit()
    return {"message": "Staff node removed from system"}