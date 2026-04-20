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
    invoices = relationship("Invoice", back_populates="hospital")

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
    staff_profile = relationship("Staff", back_populates="user", uselist=False)
class Patient(Base):
    __tablename__ = "patients"
    
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    uhid = Column(String, unique=True, index=True, nullable=True)
    phone_number = Column(String, nullable=True)
    address = Column(String, nullable=True)
    visit_type = Column(String, nullable=True) # e.g., OPD, Emergency
    doctor_name = Column(String, nullable=True)
    status = Column(String, default="Registered")
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
    invoices = relationship("Invoice", back_populates="patient")

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    doctor_id = Column(Integer, ForeignKey("staff.id"))

    hospital_name = Column(String)
    appointment_date = Column(Date)
    appointment_time = Column(Time)
    status = Column(String, default="Scheduled") # Scheduled, Completed, Cancelled
    reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Staff",back_populates="appointments" )

class MedicalRecord(Base):
    __tablename__ = "medical_records"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    diagnosis = Column(Text, nullable=True)
    clinical_notes = Column(Text, nullable=True)

    appointment_id = Column(Integer, ForeignKey("appointments.id"))
    record_type = Column(String) # e.g., "Prescription", "Lab Report"
    issued_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    file_url = Column(String) # Link to the file storage
    description = Column(String, nullable=True)

    patient = relationship("Patient", back_populates="medical_records")
    doctor = relationship("Doctor", back_populates="medical_records")

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
    staff_members = relationship(
        "Staff", 
        back_populates="department",
        foreign_keys="[Staff.dept_id]"
    )
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
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    # One-to-One Relationships to specialized profiles
    user = relationship("User", back_populates="staff_profile")   

    appointments = relationship("Appointment", back_populates="doctor")
    doctor_profile = relationship("Doctor", back_populates="staff_info", uselist=False)
    nurse_profile = relationship("Nurse", back_populates="staff_info", uselist=False)
    receptionist_profile = relationship("Receptionist", back_populates="staff_info", uselist=False)
    lab_tech_profile = relationship("LabTechnician", back_populates="staff_info", uselist=False)
    pharmacist_profile = relationship("Pharmacist", back_populates="staff_info", uselist=False)
    department = relationship(
        "Department", 
        back_populates="staff_members", 
        foreign_keys=[dept_id] # Use dept_id here
    )
    # ================== SPECIALIZED ROLE TABLES ==================

class Doctor(Base):
    __tablename__ = "doctors"
    id = Column(Integer, primary_key=True)
    staff_ref_id = Column(Integer, ForeignKey("staff.id"), unique=True)
    
    # --- PROFESSIONAL IDENTITY ---
    specialization = Column(String) 
    license_no = Column(String, unique=True)
    qualification = Column(String) # e.g., MBBS, MD (Medicine)
    experience_years = Column(Integer)
    bio = Column(Text, nullable=True) # Short professional summary
    
    # --- FACILITY LOGISTICS ---
    consultation_fee = Column(Float, default=500.0)
    opd_room_no = Column(String)
    is_hod = Column(Boolean, default=False)
    signature_url = Column(String, nullable=True) # Path to digital sign
    
    # --- PERSONAL & EMERGENCY (Admin View) ---
    alternate_mobile = Column(String, nullable=True)
    emergency_contact_name = Column(String)
    emergency_contact_phone = Column(String)
    residential_address = Column(Text, nullable=True)
    
    staff_info = relationship("Staff", back_populates="doctor_profile")
    medical_records = relationship("MedicalRecord", back_populates="doctor")

class Nurse(Base):
    __tablename__ = "nurses"
    id = Column(Integer, primary_key=True)
    staff_ref_id = Column(Integer, ForeignKey("staff.id"), unique=True)
    
    # --- PROFESSIONAL ---
    nurse_type = Column(String) # ICU, ER, General
    certification_id = Column(String, unique=True)
    primary_skills = Column(String) # e.g., "Ventilator Support, Wound Care"
    
    # --- ASSIGNMENT ---
    ward_no = Column(String)
    floor_assignment = Column(String)
    shift_preference = Column(String) # Day/Night/Rotational
    is_head_nurse = Column(Boolean, default=False)
    
    # --- PERSONAL (Admin View) ---
    date_of_joining = Column(Date)
    blood_group = Column(String)
    emergency_contact = Column(String)
    
    staff_info = relationship("Staff", back_populates="nurse_profile")

class Receptionist(Base):
    __tablename__ = "receptionists"
    id = Column(Integer, primary_key=True)
    staff_ref_id = Column(Integer, ForeignKey("staff.id"), unique=True)
    
    # --- WORKSTATION ---
    desk_location = Column(String) # "Main Lobby", "Radiology Desk"
    extension_number = Column(String)
    assigned_terminal_id = Column(String) # PC hardware ID for security
    
    # --- PROFESSIONAL ---
    languages_known = Column(String) # "English, Hindi, Marathi"
    billing_access_level = Column(Integer, default=1) # 1: View, 2: Edit, 3: Refund
    
    # --- PERSONAL ---
    official_mobile = Column(String)
    home_address = Column(Text)
    
    staff_info = relationship("Staff", back_populates="receptionist_profile")
    
class LabTechnician(Base):
    __tablename__ = "lab_technicians"
    id = Column(Integer, primary_key=True)
    staff_ref_id = Column(Integer, ForeignKey("staff.id"), unique=True)
    
    # Diagnostic Scope
    lab_section = Column(String) # Hematology, Radiology, Microbiology, Pathology
    equipment_specialization = Column(String) # e.g., MRI Operator, CT Scan Tech
    
    # Verification
    certification_level = Column(String) # Junior, Senior, Chief Tech
    can_verify_reports = Column(Boolean, default=False) # Only seniors can sign off
    
    staff_info = relationship("Staff", back_populates="lab_tech_profile")

class Pharmacist(Base):
    __tablename__ = "pharmacists"
    id = Column(Integer, primary_key=True)
    staff_ref_id = Column(Integer, ForeignKey("staff.id"), unique=True)
    
    # Credentials
    pharmacy_license = Column(String, unique=True) # Retail/Wholesale License No.
    degree = Column(String) # B.Pharm, M.Pharm
    
    # Oversight
    inventory_access_level = Column(Integer, default=1) # High for Narcotic/Schedule X drugs
    store_assignment = Column(String) # e.g., "Main Pharmacy", "ER Medical Store"
    
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

# ================== 5. BILLING & INVOICING ==================

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    total_amount = Column(Float, default=0.0)
    status = Column(String, default="Pending")
    payment_method = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    patient = relationship("Patient", back_populates="invoices")
    hospital = relationship("Hospital", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice")

class InvoiceItem(Base):
    __tablename__ = "invoice_items"
    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    service_name = Column(String)
    unit_price = Column(Float)
    subtotal = Column(Float)
    invoice = relationship("Invoice", back_populates="items")