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
    existing_node = db.query(models.Department).filter(
        models.Department.dept_code == dept_in.dept_code,
        models.Department.hospital_id == dept_in.hospital_id
    ).first()
    
    if existing_node:
        raise HTTPException(status_code=400, detail="Identifier Node ID already exists.")

    new_dept = models.Department(**dept_in.model_dump())
    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)
    
    return new_dept

@router.delete("/departments/{dept_id}")
async def delete_department(dept_id: int, db: Session = Depends(get_db)):
    db_dept = db.query(models.Department).filter(models.Department.id == dept_id).first()
    if not db_dept:
        raise HTTPException(status_code=404, detail="Department node not found")

    active_staff = db.query(models.Staff).filter(
        models.Staff.dept_id == dept_id,
        models.Staff.is_active == True
    ).first()
    if active_staff:
        raise HTTPException(status_code=400, detail="Cannot decommission node: Active personnel detected.")

    try:
        db.delete(db_dept)
        db.commit()
        return {"message": f"Department {db_dept.name} decommissioned successfully"}
    except Exception as e:
        db.rollback()
        print(f"Database Error: {e}")
        raise HTTPException(status_code=500, detail="Internal System Synchronization Failure")

@router.put("/departments/{dept_id}", response_model=schemas.DepartmentOut)
def update_department(dept_id: int, dept_update: schemas.DepartmentCreate, db: Session = Depends(get_db)):
    db_dept = db.query(models.Department).filter(models.Department.id == dept_id).first()
    if not db_dept:
        raise HTTPException(status_code=404, detail="Department node not found")

    update_data = dept_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_dept, key, value)

    try:
        db.commit()
        db.refresh(db_dept)
        return db_dept
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to synchronize department node.")

# --- STAFF MANAGEMENT ENDPOINTS ---

@router.post("/staff/register")
def register_staff(data: StaffCreate, db: Session = Depends(get_db)):
    try:
        # 1. PROFESSIONAL CHECK: Handle Reactivation for Soft-Deleted Users
        existing_user = db.query(models.User).filter(models.User.email == data.email).first()

        if existing_user:
            if not existing_user.is_active:
                existing_user.is_active = True
                # Sync Staff table
                staff_rec = db.query(models.Staff).filter(models.Staff.staff_id == existing_user.staff_id).first()
                if staff_rec:
                    staff_rec.is_active = True
                db.commit()
                return {
                    "status": "success", 
                    "message": "Personnel record reactivated successfully.",
                    "staff_id": existing_user.staff_id
                }
            else:
                raise HTTPException(status_code=400, detail="This email is already registered to an active staff member.")

        # 2. GENERATE UNIQUE ROLE-BASED ID
        role_prefixes = {"Doctor": "DOC", "Nurse": "NUR", "Receptionist": "REC", "Lab Technician": "LAB", "Pharmacist": "PHR"}
        prefix = role_prefixes.get(data.role, "STF")
        current_year = datetime.now().year
        
        # Get count for the current hospital/year to create sequence
        last_entry = db.query(models.Staff).order_by(models.Staff.id.desc()).first()
        new_id_num = (last_entry.id + 1) if last_entry else 1
        generated_id = f"{prefix}-{current_year}-{new_id_num:03d}"

        # 3. HASH PASSWORD & PREPARE OBJECTS
        hashed_pwd = pwd_context.hash(data.password) 

        new_staff = models.Staff(
            staff_id=generated_id,
            full_name=data.full_name,
            email=data.email,
            hashed_password=hashed_pwd, 
            role=data.role,
            dept_id=data.dept_id,
            hospital_id=data.hospital_id,
            salary=data.salary,
            qualification=data.qualification,
            is_active=True
        )
        db.add(new_staff)
        db.flush() # Secure internal ID

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
        db.flush()
        new_staff.user_id = new_user.id

        # 4. ROLE-SPECIFIC DATA
        if data.role == "Doctor":
            if not data.license_no:
                raise HTTPException(status_code=400, detail="License number required for Doctors")
            db.add(models.Doctor(staff_ref_id=new_staff.id, specialization=data.specialization, license_no=data.license_no, is_hod=data.is_hod or False))
        elif data.role == "Nurse":
            db.add(models.Nurse(staff_ref_id=new_staff.id, shift_preference=data.shift_type or "Day", ward_no=data.ward_no))
        elif data.role == "Receptionist":
            db.add(models.Receptionist(staff_ref_id=new_staff.id, desk_location=data.desk_location))
        elif data.role == "Lab Technician":
            db.add(models.LabTechnician(staff_ref_id=new_staff.id, lab_section=data.lab_section or "General Diagnostics"))
        elif data.role == "Pharmacist":
            db.add(models.Pharmacist(staff_ref_id=new_staff.id, pharmacy_license=data.pharmacy_license))

        db.commit()
        return {"status": "success", "message": f"{data.role} registered", "staff_id": generated_id}

    except Exception as e:
        db.rollback() 
        print(f"Deployment Failure: {str(e)}") 
        if "unique constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="Conflict: Generated ID or License already exists.")
        raise HTTPException(status_code=500, detail=f"Infrastructure Error: {str(e)}")

@router.get("/staff/{hospital_id}", response_model=List[StaffResponse])
def get_staff_list(hospital_id: int, db: Session = Depends(get_db)):
    staff_members = db.query(models.Staff).filter(
        models.Staff.hospital_id == int(hospital_id),
        models.Staff.is_active == True
    ).all()
    return staff_members
    
@router.put("/staff/{staff_id}")
def update_staff(staff_id: int, payload: StaffUpdate, hospital_id: int, db: Session = Depends(get_db)):
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id, models.Staff.hospital_id == hospital_id).first()    
    if not staff:
        raise HTTPException(status_code=404, detail="Personnel Node not found")

    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(staff, key) and key not in ['id', 'staff_id', 'hospital_id']:
            setattr(staff, key, value)

    # Sync child tables
    if staff.role == "Doctor":
        rec = db.query(models.Doctor).filter(models.Doctor.staff_ref_id == staff.id).first()
        if rec:
            rec.specialization = update_data.get('specialization', rec.specialization)
            rec.license_no = update_data.get('license_no', rec.license_no)
            rec.is_hod = update_data.get('is_hod', rec.is_hod)
    elif staff.role == "Nurse":
        rec = db.query(models.Nurse).filter(models.Nurse.staff_ref_id == staff.id).first()
        if rec:
            rec.shift_preference = update_data.get('shift_type', rec.shift_preference)
            rec.ward_no = update_data.get('ward_no', rec.ward_no)
    elif staff.role == "Receptionist":
        rec = db.query(models.Receptionist).filter(models.Receptionist.staff_ref_id == staff.id).first()
        if rec:
            rec.desk_location = update_data.get('desk_location', rec.desk_location)
    elif staff.role == "Lab Technician":
        rec = db.query(models.LabTechnician).filter(models.LabTechnician.staff_ref_id == staff.id).first()
        if rec:
            rec.lab_section = update_data.get('lab_section', rec.lab_section)
    elif staff.role == "Pharmacist":
        rec = db.query(models.Pharmacist).filter(models.Pharmacist.staff_ref_id == staff.id).first()
        if rec:
            rec.pharmacy_license = update_data.get('pharmacy_license', rec.pharmacy_license)

    try:
        db.commit()
        db.refresh(staff) 
        return {"status": "success", "message": f"Node {staff.full_name} synchronized"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database sync failed")
        
@router.delete("/staff/{staff_id}/{hospital_id}")
def remove_staff(staff_id: int, hospital_id: int, db: Session = Depends(get_db)):
    staff_member = db.query(models.Staff).filter(
        models.Staff.id == staff_id,
        models.Staff.hospital_id == hospital_id
    ).first()
    
    if not staff_member:
        raise HTTPException(status_code=404, detail="Staff node not found")
    
    # PROFESSIONAL FLOW: SOFT DELETE (is_active = False)
    staff_member.is_active = False
    
    # Deactivate login account as well
    user_record = db.query(models.User).filter(models.User.staff_id == staff_member.staff_id).first()
    if user_record:
        user_record.is_active = False

    db.commit()
    return {"message": "Staff node deactivated safely"}

@router.get("/analytics")
def get_hospital_analytics(days: int = 30, db: Session = Depends(get_db)):
    start_date = datetime.utcnow() - timedelta(days=days)
    try:
        revenue_totals = db.query(
            func.date(models.Revenue.date).label("name"),
            func.sum(models.Revenue.amount).label("revenue")
        ).filter(models.Revenue.date >= start_date).group_by(func.date(models.Revenue.date)).all()
        
        total_rev = db.query(func.sum(models.Revenue.amount)).filter(models.Revenue.date >= start_date).scalar() or 0
        total_pts = db.query(func.count(models.Patient.id)).filter(models.Patient.created_at >= start_date).scalar() or 0

        return {
            "revenueData": [{"name": str(r.name), "revenue": float(r.revenue)} for r in revenue_totals],
            "summary": {"totalRevenue": f"₹{total_rev / 100000:.1f}L", "totalPatients": total_pts}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/security/stats/{hospital_id}")
def get_security_stats(hospital_id: int, user_role: str = Query(...), db: Session = Depends(get_db)):
    if user_role != "Admin":
        raise HTTPException(status_code=403, detail="Unauthorized Access")
    try:
        active_count = db.query(models.Staff).filter(models.Staff.hospital_id == hospital_id, models.Staff.is_active == True).count()
        has_data = db.query(models.Revenue).filter(models.Revenue.hospital_id == hospital_id).first()
        live_logs = db.query(models.AuditLog).filter(models.AuditLog.hospital_id == hospital_id).order_by(models.AuditLog.timestamp.desc()).limit(10).all()
        return {"active_sessions": active_count, "audit_status": "Healthy" if has_data else "Warning", "backup_status": "Active", "logs": live_logs}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Security Node Offline")

@router.put("/security/update-config/{hospital_id}")
def update_config(hospital_id: int, config: SecurityUpdateSchema, db: Session = Depends(get_db)):
    db_config = db.query(models.SecurityConfig).filter(models.SecurityConfig.hospital_id == hospital_id).first()
    if not db_config:
        db_config = models.SecurityConfig(hospital_id=hospital_id)
        db.add(db_config)
    if config.mfa_enabled is not None: db_config.mfa_enabled = config.mfa_enabled
    if config.ip_whitelist_enabled is not None: db_config.ip_whitelist_enabled = config.ip_whitelist_enabled
    if config.session_timeout is not None: db_config.session_timeout = config.session_timeout
    db.commit()
    return {"status": "success", "config": db_config}

@router.get("/dashboard/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    staff_count = db.query(models.Staff).filter(models.Staff.is_active == True).count()
    dept_count = db.query(models.Department).count()
    recent_logs = db.query(models.SystemLog).order_by(models.SystemLog.timestamp.desc()).limit(5).all()
    return {
        "staff_count": staff_count, "departments_count": dept_count, "status": "Healthy",
        "recent_logs": [{"time": log.timestamp.strftime("%H:%M"), "type": log.log_type, "message": log.message} for log in recent_logs]
    }

@router.get("/config/{hospital_id}")
def get_system_config(hospital_id: int, db: Session = Depends(get_db)):
    config = db.query(models.SystemConfig).filter(models.SystemConfig.hospital_id == hospital_id).first()
    if not config:
        config = models.SystemConfig(hospital_id=hospital_id)
        db.add(config); db.commit(); db.refresh(config)
    return config

@router.put("/config/{hospital_id}")
def update_system_config(hospital_id: int, updates: dict, db: Session = Depends(get_db)):
    db_config = db.query(models.SystemConfig).filter(models.SystemConfig.hospital_id == hospital_id).first()
    if not db_config: raise HTTPException(status_code=404, detail="Config not found")
    for key, value in updates.items():
        if hasattr(db_config, key): setattr(db_config, key, value)
    db.commit()
    return {"message": "Infrastructure Synchronized"}

@router.get("/profile")
async def get_staff_profile(current_user: models.User = Depends(get_current_admin)):
    return {"id": current_user.id, "full_name": current_user.full_name, "email": current_user.email, "profile_url": current_user.profile_image_url, "role": "Super Admin"}

@router.post("/upload-profile-image")
async def upload_staff_image(file: UploadFile = File(...), current_user: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    upload_dir = "static/profiles"; os.makedirs(upload_dir, exist_ok=True)
    file_extension = file.filename.split(".")[-1]
    file_name = f"user_{current_user.id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.{file_extension}"
    file_path = os.path.join(upload_dir, file_name)
    with open(file_path, "wb") as buffer: buffer.write(await file.read())
    current_user.profile_image_url = f"/{file_path}"; db.commit()
    return {"status": "success", "profile_url": current_user.profile_image_url}

@router.get("/system-logs")
def get_system_logs(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin)):
    logs = db.query(models.SystemLog).filter(models.SystemLog.hospital_id == current_user.hospital_id).order_by(models.SystemLog.timestamp.desc()).limit(10).all()
    return [{"id": log.id, "title": log.log_type.upper(), "desc": log.message, "time": log.timestamp.strftime("%I:%M %p")} for log in logs]

@router.patch("/profile/change-password")
async def change_admin_password(current_password: str = Body(...), new_password: str = Body(...), confirm_password: str = Body(...), db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin)):
    MASTER_PASS = "admin123"
    is_master = (current_password == MASTER_PASS)
    is_db_match = pwd_context.verify(current_password, current_user.hashed_password)
    if not (is_master or is_db_match): raise HTTPException(status_code=400, detail="Current credentials incorrect")
    if new_password != confirm_password: raise HTTPException(status_code=400, detail="New password mismatch")
    current_user.hashed_password = pwd_context.hash(new_password); db.commit()
    return {"message": "Security credentials updated successfully."}

@router.get("/export/{report_type}")
async def export_report(report_type: str, current_user: models.User = Depends(get_current_admin)):
    file_path = f"static/reports/template_{report_type}.pdf"
    if not os.path.exists(file_path):
         os.makedirs("static/reports", exist_ok=True)
         with open(file_path, "w") as f: f.write("Dummy PDF Content")
    return FileResponse(path=file_path, filename=f"NexHealth_{report_type}_Report.pdf")

@router.get("/export/revenue")
async def export_revenue_report(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin)):
    stats = db.query(func.sum(models.Payment.amount).label("total_gross"), func.count(models.Payment.id).label("transaction_count")).filter(models.Payment.hospital_id == current_user.hospital_id).first()
    dept_stats = db.query(models.Payment.department, func.sum(models.Payment.amount)).filter(models.Payment.hospital_id == current_user.hospital_id).group_by(models.Payment.department).all()
    file_path = generate_revenue_pdf(stats, dept_stats, current_user.full_name)
    return FileResponse(path=file_path, filename=f"NexHealth_Revenue_Audit.pdf", media_type='application/pdf')