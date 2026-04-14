from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, DateTime, Time, Text, Float, event
from sqlalchemy.orm import relationship
from app.db.session import Base
from datetime import datetime, timezone

# ================== INFRASTRUCTURE & REVENUE ==================

class Hospital(Base):
    __tablename__ = "hospitals"
    id = Column(Integer, primary_key=True, index=True)
    hfr_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    admin_email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=True)
    category = Column(String, nullable=True) 
    facility_type = Column(String, nullable=True) 
    address = Column(Text, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    bed_capacity = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    users = relationship("User", back_populates="hospital")
    patients = relationship("Patient", back_populates="hospital")
    departments = relationship("Department", back_populates="hospital")
    invoices = relationship("Invoice", back_populates="hospital")

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    dept_code = Column(String, nullable=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    
    hospital = relationship("Hospital", back_populates="departments")

class Revenue(Base):
    __tablename__ = "revenue"
    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    amount = Column(Float, nullable=False)
    category = Column(String) 
    date = Column(DateTime, default=lambda: datetime.now(timezone.utc))

# ================== IDENTITY & USERS ==================

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=True)
    staff_id = Column(String, unique=True, index=True, nullable=True) 
    phone = Column(String, unique=True, index=True, nullable=True) 
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False) # 'Admin', 'Staff', 'Patient'
    sub_role = Column(String, nullable=True) # 'Doctor', 'Receptionist'
    
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    hospital = relationship("Hospital", back_populates="users")
    patient_profile = relationship("Patient", back_populates="user", uselist=False)
    appointments = relationship("Appointment", back_populates="doctor")

# ================== PATIENTS & CLINICAL ==================

class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False) 
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True) 
    
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    phone_number = Column(String(15), nullable=False, index=True)
    date_of_birth = Column(Date, nullable=False) 
    gender = Column(String(10), nullable=False)
    address = Column(Text, nullable=True)
    
    # Dashboard Tracking (Your Core Work)
    visit_type = Column(String, default="New Patient")
    status = Column(String, default="Registered")
    abha_id = Column(String(20), unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="patient_profile")
    hospital = relationship("Hospital", back_populates="patients")
    appointments = relationship("Appointment", back_populates="patient")
    invoices = relationship("Invoice", back_populates="patient")
    medical_records = relationship("MedicalRecord", back_populates="patient")

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    doctor_id = Column(Integer, ForeignKey("users.id"))
    
    doctor_name = Column(String)
    appointment_date = Column(Date)
    appointment_time = Column(Time, nullable=True)
    reason = Column(String, nullable=True)
    status = Column(String, default="Scheduled") 
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("User", back_populates="appointments")

class MedicalRecord(Base):
    __tablename__ = "medical_records"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    record_type = Column(String) # "Prescription", "Lab Report"
    diagnosis = Column(Text, nullable=True)
    clinical_notes = Column(Text, nullable=True)
    file_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    patient = relationship("Patient", back_populates="medical_records")

# ================== BILLING (YOUR CORE WORK) ==================

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    total_amount = Column(Float, default=0.0)
    status = Column(String, default="Pending")
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

# ================== LOGGING & EVENTS ==================

class SystemLog(Base):
    __tablename__ = "system_logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    log_type = Column(String)
    message = Column(String)

@event.listens_for(Hospital, 'after_insert')
def receive_after_insert_hospital(mapper, connection, target):
    connection.execute(SystemLog.__table__.insert().values(
        log_type="SYNC",
        message=f"Facility Node Activated: {target.name}"
    ))