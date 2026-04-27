from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.schemas import DepartmentOut, DepartmentCreate
from ..db.session import get_db
from ..db import models
from ..schemas.auth_schema import StaffCreate, StaffResponse, StaffUpdate
from ..utils import pwd_context 
from app import schemas
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
import subprocess
import os

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])

class SecurityUpdateSchema(BaseModel):
    mfa_enabled: Optional[bool] = None
    ip_whitelist_enabled: Optional[bool] = None
    session_timeout: Optional[int] = None


# --- DEPARTMENT ENDPOINTS ---

@router.get("/departments/{hospital_id}", response_model=List[DepartmentOut])
def get_departments(hospital_id: int, db: Session = Depends(get_db)):
    departments = db.query(models.Department).filter(
        models.Department.hospital_id == hospital_id
    ).all()
    return departments

@router.post("/departments", response_model=schemas.DepartmentOut, status_code=status.HTTP_201_CREATED)
def create_department(dept_in: schemas.DepartmentCreate, db: Session = Depends(get_db)):
    # 1. Validation: Check if this code is already used in this specific hospital
    existing_node = db.query(models.Department).filter(
        models.Department.dept_code == dept_in.dept_code,
        models.Department.hospital_id == dept_in.hospital_id
    ).first()
    
    if existing_node:
        raise HTTPException(status_code=400, detail="Identifier Node ID already exists.")

    # 2. Create and Save
    new_dept = models.Department(**dept_in.model_dump())
    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)
    
    return new_dept

@router.delete("/departments/{dept_id}")
async def delete_department(dept_id: int, db: Session = Depends(get_db)):
    # 1. Locate the department
    db_dept = db.query(models.Department).filter(models.Department.id == dept_id).first()
    
    if not db_dept:
        raise HTTPException(status_code=404, detail="Department node not found")

    # 2. Check for active staff nodes to prevent Foreign Key errors
    # This prevents the crash at the database level
    active_staff = db.query(models.Staff).filter(models.Staff.dept_id == dept_id).first()
    if active_staff:
        raise HTTPException(
            status_code=400, 
            detail="Cannot decommission node: Active personnel detected. Transfer staff first."
        )

    try:
        # 3. Safe to delete
        db.delete(db_dept)
        db.commit()
        return {"message": f"Department {db_dept.name} decommissioned successfully"}
    except Exception as e:
        db.rollback()
        # Log the actual error for your terminal
        print(f"Database Error: {e}")
        raise HTTPException(status_code=500, detail="Internal System Synchronization Failure")

# --- ADD THIS TO YOUR DEPARTMENT ENDPOINTS ---

@router.put("/departments/{dept_id}", response_model=schemas.DepartmentOut)
def update_department(
    dept_id: int, 
    dept_update: schemas.DepartmentCreate, # Or use a specific Update schema if you have one
    db: Session = Depends(get_db)
):
    # 1. Locate the existing record
    db_dept = db.query(models.Department).filter(models.Department.id == dept_id).first()
    
    if not db_dept:
        raise HTTPException(status_code=404, detail="Department node not found")

    # 2. Update the fields dynamically
    update_data = dept_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_dept, key, value)

    try:
        db.commit()
        db.refresh(db_dept)
        return db_dept
    except Exception as e:
        db.rollback()
        print(f"Update Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to synchronize department node.")
# --- STAFF MANAGEMENT ENDPOINTS ---

@router.post("/staff/register")
def register_staff(data: StaffCreate, db: Session = Depends(get_db)):
    try:
        # 1. HASH THE PASSWORD
        hashed_pwd = pwd_context.hash(data.password) 

        # 2. GENERATE ROLE-BASED ID
        role_prefixes = {
            "Doctor": "DOC", 
            "Nurse": "NUR", 
            "Receptionist": "REC",
            "Lab Technician": "LAB",
            "Pharmacist": "PHR"
        }
        prefix = role_prefixes.get(data.role, "STF")
        
        # We check for ANY staff member in 2026 to ensure the number is always unique
        last_entry = db.query(models.Staff)\
            .filter(
                models.Staff.staff_id.contains("-2026-"),
                models.Staff.hospital_id == data.hospital_id
            )\
            .order_by(models.Staff.id.desc())\
            .first()

        if last_entry:
            try:
                last_id_parts = last_entry.staff_id.split('-')
                new_id_num = int(last_id_parts[-1]) + 1
            except (ValueError, IndexError):
                new_id_num = 1
        else:
            new_id_num = 1

        generated_id = f"{prefix}-2026-{new_id_num:03d}"

        # 3. PREPARE PRIMARY STAFF OBJECT (Indented inside try)
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
        # --- STEP 3.5: AUTOMATICALLY CREATE LOGIN ACCOUNT ---
        # This removes the need for manual SQL inserts
        new_user = models.User(
            staff_id=generated_id,
            full_name=data.full_name,
            email=data.email,
            hashed_password=hashed_pwd, 
            role=data.role,
            hospital_id=data.hospital_id,
            department_id=data.dept_id,
            sub_role=data.role,
            is_active=True
        )
        db.add(new_user)
        db.flush() # Generates new_staff.id for child tables

        # 4. PREPARE SPECIALIZED DATA (Role-Specific)
        if data.role == "Doctor":
            if not data.license_no:
                raise HTTPException(status_code=400, detail="License number is required for Doctors")
            new_doc = models.Doctor(
                staff_ref_id=new_staff.id,
                specialization=data.specialization,
                license_no=data.license_no,
                is_hod=data.is_hod or False
            )
            db.add(new_doc)
        
        elif data.role == "Nurse":
            new_nurse = models.Nurse(
                staff_ref_id=new_staff.id,
                shift_preference=data.shift_type or "Day",
                ward_no=data.ward_no
            )
            db.add(new_nurse)
        elif data.role == "Receptionist":
            new_receptionist = models.Receptionist(
                staff_ref_id=new_staff.id,
                desk_location=data.desk_location
            )
            db.add(new_receptionist)
        elif data.role in ("Lab Technician", "LabTechnician"):
            new_lab_technician = models.LabTechnician(
                staff_ref_id=new_staff.id,
                lab_section=data.lab_section
            )
            db.add(new_lab_technician)
        elif data.role == "Pharmacist":
            new_pharmacist = models.Pharmacist(
                staff_ref_id=new_staff.id,
                pharmacy_license=data.pharmacy_license
            )
            db.add(new_pharmacist)

        # 5. FINAL COMMIT (Atomic)
        db.commit()
        db.refresh(new_staff)

        return {
            "status": "success",
            "message": f"{data.role} registered successfully",
            "staff_id": generated_id,
            "internal_id": new_staff.id
        }

    except Exception as e:
        db.rollback() 
        print(f"Deployment Failure: {str(e)}") 
        if "unique constraint" in str(e).lower():
            raise HTTPException(
                status_code=400, 
                detail=f"Conflict: The generated ID {generated_id} or License Number already exists."
            )
        raise HTTPException(status_code=500, detail=f"Infrastructure Error: {str(e)}")

@router.get("/staff/{hospital_id}", response_model=List[StaffResponse])
def get_staff_list(hospital_id: int, db: Session = Depends(get_db)):
    # Explicitly ensure hospital_id is used as an int in the filter
    staff_members = db.query(models.Staff).filter(
        models.Staff.hospital_id == int(hospital_id)
    ).all()
    
    print(f"DEBUG: Fetching staff for Hospital ID: {hospital_id}")
    print(f"DEBUG: Found {len(staff_members)} members")
    
    return staff_members
    
@router.put("/staff/{staff_id}")
def update_staff(staff_id: int, payload: StaffUpdate, hospital_id: int, db: Session = Depends(get_db)):
    # 1. Fetch main staff record using the PRIMARY KEY (id)
    staff = db.query(models.Staff).filter(
        models.Staff.id == staff_id,
        models.Staff.hospital_id == hospital_id 
    ).first()    
    if not staff:
        raise HTTPException(status_code=404, detail="Personnel Node not found")

    # 2. Extract data from payload
    update_data = payload.dict(exclude_unset=True)
    
    # 3. Update main Staff table
    # We use list(update_data.keys()) to avoid 'dictionary changed size' errors
    for key, value in update_data.items():
        # Only update columns that actually exist in the Staff model
        if hasattr(staff, key) and key not in ['id', 'staff_id', 'hospital_id']:
            setattr(staff, key, value)

    # 4. Sync Specialized Tables
    # This is crucial because specialized role info is stored separately
    if staff.role == "Doctor":
        doc_record = db.query(models.Doctor).filter(models.Doctor.staff_ref_id == staff.id).first()
        if doc_record:
            doc_record.specialization = update_data.get('specialization', doc_record.specialization)
            doc_record.license_no = update_data.get('license_no', doc_record.license_no)
            doc_record.is_hod = update_data.get('is_hod', doc_record.is_hod)

    elif staff.role == "Nurse":
        nurse_record = db.query(models.Nurse).filter(models.Nurse.staff_ref_id == staff.id).first()
        if nurse_record:
            nurse_record.shift_preference = update_data.get('shift_type', nurse_record.shift_preference)
            nurse_record.ward_no = update_data.get('ward_no', nurse_record.ward_no)
    elif staff.role == "Receptionist":
        receptionist_record = db.query(models.Receptionist).filter(models.Receptionist.staff_ref_id == staff.id).first()
        if receptionist_record:
            receptionist_record.desk_location = update_data.get('desk_location', receptionist_record.desk_location)
    elif staff.role in ("Lab Technician", "LabTechnician"):
        lab_technician_record = db.query(models.LabTechnician).filter(models.LabTechnician.staff_ref_id == staff.id).first()
        if lab_technician_record:
            lab_technician_record.lab_section = update_data.get('lab_section', lab_technician_record.lab_section)
    elif staff.role == "Pharmacist":
        pharmacist_record = db.query(models.Pharmacist).filter(models.Pharmacist.staff_ref_id == staff.id).first()
        if pharmacist_record:
            pharmacist_record.pharmacy_license = update_data.get('pharmacy_license', pharmacist_record.pharmacy_license)

    try:
        db.commit()
        # Refresh is important to return the latest state
        db.refresh(staff) 
        return {
            "status": "success",
            "message": f"Node {staff.full_name} synchronized successfully"
        }
    except Exception as e:
        db.rollback()
        print(f"Update Error: {e}") # This helps you see the error in your terminal
        raise HTTPException(status_code=500, detail="Database sync failed")
        
# Add hospital_id check to your queries
@router.delete("/staff/{staff_id}/{hospital_id}")
def remove_staff(staff_id: int, hospital_id: int, db: Session = Depends(get_db)):
    staff_member = db.query(models.Staff).filter(
        models.Staff.id == staff_id,
        models.Staff.hospital_id == hospital_id # Double-check the ownership!
    ).first()
    
    if not staff_member:
        # 404 is better for security so they don't know if the ID exists at another hospital
        raise HTTPException(status_code=404, detail="Staff node not found in your facility")
    
    # Remove specialized profile first to avoid FK constraint issues.
    if staff_member.role == "Doctor":
        doc_profile = db.query(models.Doctor).filter(models.Doctor.staff_ref_id == staff_member.id).first()
        if doc_profile:
            db.delete(doc_profile)
    elif staff_member.role == "Nurse":
        nurse_profile = db.query(models.Nurse).filter(models.Nurse.staff_ref_id == staff_member.id).first()
        if nurse_profile:
            db.delete(nurse_profile)
    elif staff_member.role == "Receptionist":
        receptionist_profile = db.query(models.Receptionist).filter(models.Receptionist.staff_ref_id == staff_member.id).first()
        if receptionist_profile:
            db.delete(receptionist_profile)
    elif staff_member.role in ("Lab Technician", "LabTechnician"):
        lab_profile = db.query(models.LabTechnician).filter(models.LabTechnician.staff_ref_id == staff_member.id).first()
        if lab_profile:
            db.delete(lab_profile)
    elif staff_member.role == "Pharmacist":
        pharmacist_profile = db.query(models.Pharmacist).filter(models.Pharmacist.staff_ref_id == staff_member.id).first()
        if pharmacist_profile:
            db.delete(pharmacist_profile)

    db.delete(staff_member)
    db.commit()
    return {"message": "Staff node removed safely"}

@router.get("/analytics")
def get_hospital_analytics(days: int = 30, db: Session = Depends(get_db)):
    # Use datetime.datetime.utcnow() to match your model defaults
    start_date = datetime.datetime.utcnow() - datetime.timedelta(days=days)
    
    try:
        # 1. Query Revenue (Ensure models.Revenue exists in models.py)
        revenue_totals = (
            db.query(
                func.date(models.Revenue.date).label("name"),
                func.sum(models.Revenue.amount).label("revenue")
            )
            .filter(models.Revenue.date >= start_date)
            .group_by(func.date(models.Revenue.date))
            .all()
        )
        
        # 2. Summary Stats
        total_rev = db.query(func.sum(models.Revenue.amount)).filter(models.Revenue.date >= start_date).scalar() or 0
        total_pts = db.query(func.count(models.Patient.id)).filter(models.Patient.created_at >= start_date).scalar() or 0

        return {
            "revenueData": [{"name": str(r.name), "revenue": float(r.revenue)} for r in revenue_totals],
            "summary": {
                "totalRevenue": f"₹{total_rev / 100000:.1f}L",
                "totalPatients": total_pts
            }
        }
    except Exception as e:
        print(f"CRITICAL ERROR: {e}") # Check your terminal for this!
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/security/stats/{hospital_id}")
def get_security_stats(hospital_id: int, user_role: str = Query(...), db: Session = Depends(get_db)):
    if user_role != "Admin":
        raise HTTPException(status_code=403, detail="Unauthorized Access")

    try:
        # 1. Count Staff
        active_count = db.query(models.Staff).filter(
            models.Staff.hospital_id == hospital_id
        ).count()
        
        # 2. Check Revenue
        has_data = db.query(models.Revenue).filter(
            models.Revenue.hospital_id == hospital_id
        ).first()

        # 3. Fetch Live Activity Logs
        live_logs = db.query(models.AuditLog).filter(
            models.AuditLog.hospital_id == hospital_id
        ).order_by(models.AuditLog.timestamp.desc()).limit(10).all()

        return {
            "active_sessions": active_count,
            "audit_status": "Healthy" if has_data else "Warning",
            "backup_status": "Active",
            "logs": live_logs
        }

    except Exception as e:
        print(f"CRITICAL SECURITY ERROR: {e}")
        raise HTTPException(status_code=500, detail="Security Node Offline")

@router.put("/security/update-config/{hospital_id}")
def update_config(hospital_id: int, config: SecurityUpdateSchema, db: Session = Depends(get_db)):
    db_config = db.query(models.SecurityConfig).filter(models.SecurityConfig.hospital_id == hospital_id).first()

    if not db_config:
        db_config = models.SecurityConfig(hospital_id=hospital_id)
        db.add(db_config)

    # Update fields if they were provided in the request
    if config.mfa_enabled is not None:
        db_config.mfa_enabled = config.mfa_enabled
    if config.ip_whitelist_enabled is not None:
        db_config.ip_whitelist_enabled = config.ip_whitelist_enabled
    if config.session_timeout is not None:
        db_config.session_timeout = config.session_timeout

    db.commit()
    return {"status": "success", "config": db_config}

@router.get("/dashboard/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    # 1. Get counts for the Stat Cards
    staff_count = db.query(models.Staff).count()
    dept_count = db.query(models.Department).count()
    
    # 2. Get the 5 most recent logs for the Local Node Feed
    recent_logs = db.query(models.SystemLog)\
                    .order_by(models.SystemLog.timestamp.desc())\
                    .limit(5).all()

    return {
        "staff_count": staff_count,
        "departments_count": dept_count,
        "status": "Healthy",
        "recent_logs": [
            {
                "time": log.timestamp.strftime("%H:%M"),
                "type": log.log_type,
                "message": log.message
            } for log in recent_logs
        ]
    }
    
# system config


@router.get("/config/{hospital_id}")
def get_system_config(hospital_id: int, db: Session = Depends(get_db)):
    config = db.query(models.SystemConfig).filter(models.SystemConfig.hospital_id == hospital_id).first()
    if not config:
        # Create a default entry if it's the first time visiting
        config = models.SystemConfig(hospital_id=hospital_id)
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

@router.put("/config/{hospital_id}")
def update_system_config(hospital_id: int, updates: dict, db: Session = Depends(get_db)):
    db_config = db.query(models.SystemConfig).filter(models.SystemConfig.hospital_id == hospital_id).first()
    if not db_config:
        raise HTTPException(status_code=404, detail="Config not found")
    
    for key, value in updates.items():
        if hasattr(db_config, key):
            setattr(db_config, key, value)
            
    db.commit()
    return {"message": "Infrastructure Synchronized"}