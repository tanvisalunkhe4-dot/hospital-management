from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql.functions import now
from sqlalchemy import event
from app.db.session import Base
from datetime import datetime, timezone
from sqlalchemy import Date, Time
class Revenue(Base):
    __tablename__ = "revenue"
    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    amount = Column(Float, nullable=False)
    category = Column(String) 
    # Indented and updated to use the direct class call
    date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
class Hospital(Base):
    __tablename__ = "hospitals"
    id = Column(Integer, primary_key=True, index=True)
    hfr_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    admin_email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=True)
    category = Column(String, nullable=True) 
    facility_type = Column(String, nullable=True) 
    address = Column(Text, nullable=True) # Changed to Text for longer addresses
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    bed_capacity = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    # Relationships
    users = relationship("User", back_populates="hospital")
    departments = relationship("Department", back_populates="hospital") # Added this
    patients = relationship("Patient", back_populates="hospital")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=True) # Added: Essential for UI
    email = Column(String, unique=True, index=True, nullable=True)
    staff_id = Column(String, unique=True, index=True, nullable=True) # Set to Unique
    phone = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False) # 'Admin', 'Staff', 'Patient', 'SuperAdmin'
    sub_role = Column(String, nullable=True) # 'Doctor', 'Nurse', 'Receptionist'
    
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True) # Added: Link staff to Dept
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    # Relationships
    hospital = relationship("Hospital", back_populates="users")
    department = relationship("Department", foreign_keys=[department_id])
    patient_profile = relationship("Patient", back_populates="user", uselist=False)

class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    abha_id = Column(String, unique=True, index=True, nullable=True)
    date_of_birth = Column(DateTime, nullable=True) # Added for medical records
    gender = Column(String, nullable=True)
    blood_group = Column(String, nullable=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))    
    
    user = relationship("User", back_populates="patient_profile")
    hospital = relationship("Hospital", back_populates="patients")
    appointments = relationship("Appointment", back_populates="patient")
    medical_records = relationship("MedicalRecord", back_populates="patient")

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    hospital_id = Column(Integer, ForeignKey("hospital.id"))
    doctor_id = Column(Integer, ForeignKey("staff.id"))
    doctor_name = Column(String)

    hospital_name = Column(String)
    appointment_date = Column(Date)
    appointment_time = Column(Time)
    status = Column(String, default="Scheduled") # Scheduled, Completed, Cancelled
    reason = Column(String, nullable=True)

    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Staff")

class MedicalRecord(Base):
    __tablename__ = "medical_records"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    appointment_id = Column(Integer, ForeignKey("appointments.id"))
    record_type = Column(String) # e.g., "Prescription", "Lab Report"
    issued_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    file_url = Column(String) # Link to the file storage
    description = Column(String, nullable=True)

    patient = relationship("Patient", back_populates="medical_records")
    
class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    dept_code = Column(String, nullable=True) # New
    head_of_dept = Column(String)    
    location = Column(String, nullable=True)  # New
    contact_number = Column(String, nullable=True) # New
    dept_type = Column(String, default="Clinical") # New
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))   
     # Relationships
    hospital = relationship("Hospital", back_populates="departments")

# ================== CORE IDENTITY ==================
class Staff(Base):
    __tablename__ = "staff"
    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(String, unique=True, index=True) # e.g. DOC-001
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String) # 'Doctor', 'Nurse', 'Pharmacist', etc.
    dept_id = Column(Integer, ForeignKey("departments.id"))
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    salary = Column(Float)
    qualification = Column(String)

    # One-to-One Relationships to specialized profiles
    doctor_profile = relationship("Doctor", back_populates="staff_info", uselist=False)
    nurse_profile = relationship("Nurse", back_populates="staff_info", uselist=False)
    receptionist_profile = relationship("Receptionist", back_populates="staff_info", uselist=False)
    lab_tech_profile = relationship("LabTechnician", back_populates="staff_info", uselist=False)
    pharmacist_profile = relationship("Pharmacist", back_populates="staff_info", uselist=False)

# ================== SPECIALIZED ROLE TABLES ==================

class Doctor(Base):
    __tablename__ = "doctors"
    id = Column(Integer, primary_key=True)
    staff_ref_id = Column(Integer, ForeignKey("staff.id"), unique=True)
    specialization = Column(String)
    license_no = Column(String, unique=True)
    is_hod = Column(Boolean, default=False)
    
    staff_info = relationship("Staff", back_populates="doctor_profile")

class Nurse(Base):
    __tablename__ = "nurses"
    id = Column(Integer, primary_key=True)
    staff_ref_id = Column(Integer, ForeignKey("staff.id"), unique=True)
    shift_type = Column(String) # Day, Night, Rotational
    ward_no = Column(String)
    
    staff_info = relationship("Staff", back_populates="nurse_profile")

class Receptionist(Base):
    __tablename__ = "receptionists"
    id = Column(Integer, primary_key=True)
    staff_ref_id = Column(Integer, ForeignKey("staff.id"), unique=True)
    desk_location = Column(String) # e.g. "Front Desk", "ER Entrance"
    
    staff_info = relationship("Staff", back_populates="receptionist_profile")

class LabTechnician(Base):
    __tablename__ = "lab_technicians"
    id = Column(Integer, primary_key=True)
    staff_ref_id = Column(Integer, ForeignKey("staff.id"), unique=True)
    lab_section = Column(String) # Pathology, Hematology, etc.
    
    staff_info = relationship("Staff", back_populates="lab_tech_profile")

class Pharmacist(Base):
    __tablename__ = "pharmacists"
    id = Column(Integer, primary_key=True)
    staff_ref_id = Column(Integer, ForeignKey("staff.id"), unique=True)
    pharmacy_license = Column(String)
    
    staff_info = relationship("Staff", back_populates="pharmacist_profile")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer)
    personnel = Column(String)
    node = Column(String)
    action_executed = Column(String)
    status = Column(String)
    # Indented and updated to use modern UTC call 
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class SecurityConfig(Base):
    __tablename__ = "security_configs"

    # hospital_id acts as both the Primary Key and a Foreign Key linking to the Hospitals table
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), primary_key=True)
    mfa_enabled = Column(Boolean, default=False)
    ip_whitelist_enabled = Column(Boolean, default=False)
    session_timeout = Column(Integer, default=30)

class BackupLog(Base):
    __tablename__ = "backup_logs"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    filename = Column(String)
    # Use this lambda to ensure the time is captured when the record is created
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status = Column(String)

class SystemLog(Base):
    __tablename__ = "system_logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    log_type = Column(String)  # e.g., "DATA", "SYNC"
    message = Column(String)
    

# Automatically log when a NEW STAFF is registered
@event.listens_for(Staff, 'after_insert')
def receive_after_insert_staff(mapper, connection, target):
    connection.execute(
        SystemLog.__table__.insert().values(
            log_type="DATA",
            message=f"Registry Updated: {target.full_name} has been synchronized."
        )
    )

# Updated robust listeners
@event.listens_for(Department, 'after_insert')
def receive_after_insert_dept(mapper, connection, target):
    try:
        connection.execute(
            SystemLog.__table__.insert().values(
                log_type="SYNC",
                message=f"Node Created: {target.name or 'Unknown'} infrastructure is live."
            )
        )
    except Exception as e:
        print(f"Logging Error: {e}") # This will show in your terminal, not as a 500

# Automatically log when STAFF is removed
@event.listens_for(Staff, 'after_delete')
def receive_after_delete_staff(mapper, connection, target):
    connection.execute(
        SystemLog.__table__.insert().values(
            log_type="DATA",
            message=f"Registry Modified: {target.full_name} decommissioned."
        )
    )

class SystemConfig(Base):
    __tablename__ = "system_configs"

    hospital_id = Column(Integer, ForeignKey("hospitals.id"), primary_key=True)
    # Hospital Identity
    hospital_name = Column(String, default="NexHealth Digital Facility")
    branch_code = Column(String, default="NX-MUM-01")
    license_no = Column(String, default="REG-MH-2026-X100")
    
    # Revenue Logic
    currency = Column(String, default="INR (₹)")
    tax_rate = Column(Float, default=18.0)
    
    # Communications
    email_alerts = Column(Boolean, default=True)

    hospital = relationship("Hospital")