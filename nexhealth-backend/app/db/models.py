from sqlalchemy import Column, Integer, String, Boolean, Float 
from sqlalchemy.orm import relationship
from app.db.session import Base
from sqlalchemy.sql import func
from sqlalchemy.sql.functions import now    
import datetime
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, DateTime, Time, Text
from sqlalchemy import JSON

class Hospital(Base):
    __tablename__ = "hospitals"
    id = Column(Integer, primary_key=True, index=True)
    hfr_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    admin_email = Column(String, unique=True, nullable=False)
    
    # --- Professional Info ---
    phone = Column(String, nullable=True)
    category = Column(String, nullable=True) 
    facility_type = Column(String, nullable=True) 
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    bed_capacity = Column(Integer, default=0)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=now()) 
    
    # Relationships
    users = relationship("User", back_populates="hospital")
    patients = relationship("Patient", back_populates="hospital") # Added this link

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    staff_id = Column(String, index=True, nullable=True) 
    phone = Column(String, index=True, nullable=True) 
    hashed_password = Column(String, nullable=True)
    role = Column(String, nullable=False) 
    sub_role = Column(String, nullable=True) 
    
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    is_active = Column(Boolean, default=True)

    # Relationships
    hospital = relationship("Hospital", back_populates="users")
    patient_profile = relationship("Patient", back_populates="user", uselist=False)
    appointments = relationship("Appointment", back_populates="doctor")

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Professional details
    specialization = Column(String(100), default="General Physician")
    license_number = Column(String(50), unique=True, nullable=True)
    department = Column(String(100), nullable=True)
    
    # Relationships
    user = relationship("User")
    medical_records = relationship("MedicalRecord", back_populates="doctor")

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
    
    # --- Dashboard Tracking Fields ---
    visit_type = Column(String, default="New Patient")
    doctor_name = Column(String, default="TBD")
    status = Column(String, default="Registered")
    created_at = Column(DateTime(timezone=True), server_default=now())
    
    abha_id = Column(String(20), unique=True, index=True, nullable=True)

    # Relationships 
    user = relationship("User", back_populates="patient_profile")
    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete-orphan")
    hospital = relationship("Hospital", back_populates="patients")
    invoices = relationship("Invoice", back_populates="patient")

    def __repr__(self):
        return f"<Patient {self.first_name} {self.last_name}>"

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    
    patient_id = Column(Integer, ForeignKey("patients.id"))
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    doctor_id = Column(Integer, ForeignKey("users.id"))
    
    doctor_name = Column(String)  # For quick display without a join
    appointment_date = Column(Date)
    appointment_time = Column(Time, nullable=True)
    reason = Column(String, nullable=True)
    status = Column(String, default="Scheduled") 
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("User")

class Bill(Base):
    __tablename__ = "bills"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=False)
    
    amount = Column(Integer, nullable=False) 
    tax = Column(Integer, default=0)
    total_amount = Column(Integer, nullable=False)
    
    payment_status = Column(String(20), default="Pending") 
    payment_method = Column(String(20), nullable=True) 
    created_at = Column(DateTime(timezone=True), server_default=now())

    patient = relationship("Patient")
    appointment = relationship("Appointment")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True) # e.g., INV-2026-001
    patient_id = Column(Integer, ForeignKey("patients.id"))
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    total_amount = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    status = Column(String, default="Pending") # Pending, Paid, Partially Paid, Cancelled
    payment_method = Column(String, nullable=True) # Cash, UPI, Card
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")

class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    service_name = Column(String) # e.g., "General Consultation"
    quantity = Column(Integer, default=1)
    unit_price = Column(Float)
    subtotal = Column(Float)

    invoice = relationship("Invoice", back_populates="items")


class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    appointment_id = Column(Integer, ForeignKey("appointments.id"))
    # Point this to the DOCTORS table now
    doctor_id = Column(Integer, ForeignKey("doctors.id")) 
    
    diagnosis = Column(String, nullable=True)
    clinical_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=now())

    # Relationships
    patient = relationship("Patient")
    doctor = relationship("Doctor", back_populates="medical_records")