from sqlalchemy import Column, Integer, String, Boolean, Date, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base
from sqlalchemy.sql import func
from datetime import datetime
from sqlalchemy.sql.functions import now    


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
    # Changed back_populates to match the Patient class
    patient_profile = relationship("Patient", back_populates="user", uselist=False)

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
    hospital = relationship("Hospital", back_populates="patients") # Added back_populates

    def __repr__(self):
        return f"<Patient {self.first_name} {self.last_name}>"

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    department = Column(String(50), nullable=False)
    
    appointment_date = Column(DateTime, nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(String(20), default="Scheduled") 
    created_at = Column(DateTime(timezone=True), server_default=now())

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