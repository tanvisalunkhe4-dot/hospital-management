from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Body 
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta, timezone
from app.schemas import DepartmentOut, DepartmentCreate
from ..db.session import get_db
from ..db import models
from app.router.auth import get_current_admin
from ..schemas.auth_schema import StaffCreate, StaffResponse, StaffUpdate
from ..utils import pwd_context 
from app import schemas
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
import subprocess
import os
from fastapi import BackgroundTasks
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.platypus import Table, TableStyle
from reportlab.lib import colors
from datetime import datetime

IST = timezone(timedelta(hours=5, minutes=30))
def generate_revenue_pdf(stats, dept_stats, admin_name):
    # Ensure directory exists
    os.makedirs("temp_reports", exist_ok=True)
    file_path = f"temp_reports/revenue_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    
    c = canvas.Canvas(file_path, pagesize=letter)
    
    # Safely handle potential None values from the database
    total_gross = stats.total_gross if stats and stats.total_gross else 0.0
    transaction_count = stats.transaction_count if stats and stats.transaction_count else 0

    c.setFont("Helvetica-Bold", 18)
    c.setFillColor(colors.HexColor("#10b981")) 
    c.drawString(50, 750, "NEXHEALTH: LIVE REVENUE AUDIT")
    
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.black)
    c.drawString(50, 730, f"Authorized Admin: {admin_name}")
    c.drawString(50, 715, f"Audit Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Summary Box
    c.roundRect(45, 640, 520, 60, 10, stroke=1, fill=0)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(60, 675, "Financial Overview")
    c.setFont("Helvetica", 11)
    c.drawString(60, 655, f"Total Gross Revenue: ${total_gross:,.2f}")
    c.drawString(300, 655, f"Total Transactions: {transaction_count}")

    # Table for Departments
    data = [["Department", "Revenue"]]
    if dept_stats:
        for dept, amt in dept_stats:
            data.append([str(dept or "Unknown"), f"${amt if amt else 0:,.2f}"])
    else:
        data.append(["No Data", "$0.00"])

    table = Table(data, colWidths=[250, 150])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#10b981")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    
    # Position the table
    table.wrapOn(c, 50, 400)
    table.drawOn(c, 50, 400)
    
    c.showPage()
    c.save()
    return file_path

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
        
        current_year = datetime.now().year
        # We check for ANY staff member in 2026 to ensure the number is always unique
        last_entry = db.query(models.Staff)\
            .filter(
                models.Staff.staff_id.contains(f"-{current_year}-"),
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
        new_staff.user_id = new_user.id
    
       

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
        elif data.role == "Lab Technician":
            new_lab_tech = models.LabTechnician(
                staff_ref_id=new_staff.id,
                # Use data from the schema; default to "General" if not provided
                lab_section=data.lab_section or "General Diagnostics"
            )
            db.add(new_lab_tech)
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
    elif staff.role == "Lab Technician":
        lab_record = db.query(models.LabTechnician).filter(
            models.LabTechnician.staff_ref_id == staff.id
        ).first()
        if lab_record:
            # Dynamically update the lab section if it's in the payload
            lab_record.lab_section = update_data.get('lab_section', lab_record.lab_section)
    
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
    elif staff_member.role == "Lab Technician":
        lab_profile = db.query(models.LabTechnician).filter(
            models.LabTechnician.staff_ref_id == staff_member.id
        ).first()
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


# --- app/router/admin.py (Bottom of the file) ---

@router.get("/profile")
async def get_staff_profile(current_user: models.User = Depends(get_current_admin)):
    """Fetches live Admin/Staff data from the database."""
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        # Ensure 'profile_image_url' exists in your User model
        "profile_url": current_user.profile_image_url, 
        "role": "Super Admin"
    }

@router.post("/upload-profile-image")
async def upload_staff_image(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Handles live image uploading to your static/profiles directory."""
    # 1. Create the directory if it doesn't exist
    upload_dir = "static/profiles"
    os.makedirs(upload_dir, exist_ok=True)

    # 2. Generate a unique filename
    file_extension = file.filename.split(".")[-1]
    file_name = f"user_{current_user.id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.{file_extension}"
    file_path = os.path.join(upload_dir, file_name)

    # 3. Save the file to disk
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    # 4. Update the user's profile URL in the database
    current_user.profile_image_url = f"/{file_path}"
    db.commit()

    return {"status": "success", "profile_url": current_user.profile_image_url}




# 1. MATCHING THE NOTIFICATIONS DRAWER
@router.get("/system-logs")
def get_system_logs(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin)):
    """Fetch the latest system events for the notification drawer."""
    logs = db.query(models.SystemLog)\
             .filter(models.SystemLog.hospital_id == current_user.hospital_id)\
             .order_by(models.SystemLog.timestamp.desc())\
             .limit(10).all()
             
    # Mapping to match your frontend: {title, desc}
    return [
        {
            "id": log.id,
            "title": log.log_type.upper(),
            "desc": log.message,
            "time": log.timestamp.strftime("%I:%M %p")
        } for log in logs
    ]

@router.patch("/profile/change-password")
async def change_admin_password(
    current_password: str = Body(...),
    new_password: str = Body(...),
    confirm_password: str = Body(...), # Added to match patient logic
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    # 1. Define the master password (bypass)
    MASTER_PASS = "admin123"
    
    # 2. Check if provided password is the Master Pass OR matches DB hash
    is_master = (current_password == MASTER_PASS)
    is_db_match = pwd_context.verify(current_password, current_user.hashed_password)

    if not (is_master or is_db_match):
        raise HTTPException(
            status_code=400, 
            detail="Current security credentials incorrect"
        )
        
    # 3. Validate that new password and confirm password match
    if new_password != confirm_password:
        raise HTTPException(
            status_code=400,
            detail="New password mismatch: confirmation does not match."
        )

    # 4. Hash and save new password
    current_user.hashed_password = pwd_context.hash(new_password)
    db.commit()
    
    return {"message": "Security credentials updated successfully."}


@router.get("/export/{report_type}")
async def export_report(report_type: str, current_user: models.User = Depends(get_current_admin)):
    """Placeholder for PDF generation logic."""
    # In a real app, you'd use a library like ReportLab or FPDF here
    # For now, we assume a template exists or return a dummy file
    file_path = f"static/reports/template_{report_type}.pdf"
    
    if not os.path.exists(file_path):
         # Create a dummy file for testing if it doesn't exist
         os.makedirs("static/reports", exist_ok=True)
         with open(file_path, "w") as f: f.write("Dummy PDF Content")
         
    return FileResponse(path=file_path, filename=f"NexHealth_{report_type}_Report.pdf")


@router.get("/export/revenue")
async def export_revenue_report(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    # 1. Fetch Live Summary Stats
    stats = db.query(
        func.sum(models.Payment.amount).label("total_gross"),
        func.count(models.Payment.id).label("transaction_count")
    ).filter(models.Payment.hospital_id == current_user.hospital_id).first()

    # 2. Fetch Live Departmental Data
    dept_stats = db.query(
        models.Payment.department,
        func.sum(models.Payment.amount)
    ).filter(models.Payment.hospital_id == current_user.hospital_id)\
     .group_by(models.Payment.department).all()

    # 3. Generate the PDF using ReportLab logic defined at the top
    file_path = generate_revenue_pdf(stats, dept_stats, current_user.full_name)

    return FileResponse(
        path=file_path, 
        filename=f"NexHealth_Revenue_Audit.pdf",
        media_type='application/pdf'
    )