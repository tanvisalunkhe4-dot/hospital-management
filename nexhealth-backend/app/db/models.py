from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, Float

from sqlalchemy.orm import relationship
from app.db.session import Base
from typing import Optional
import datetime

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
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    users = relationship("User", back_populates="hospital")
    departments = relationship("Department", back_populates="hospital") # Added this

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
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

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

    user = relationship("User", back_populates="patient_profile")

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    dept_code = Column(String, nullable=True) # New
    location = Column(String, nullable=True)  # New
    contact_number = Column(String, nullable=True) # New
    dept_type = Column(String, default="Clinical") # New
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))    # Relationships
    hospital = relationship("Hospital", back_populates="departments")

class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(String, unique=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)  # <--- Ensure this exact name exists
    role = Column(String)
    dept_id = Column(Integer, ForeignKey("departments.id"))
    hospital_id = Column(Integer)
    salary = Column(Float)
    qualification = Column(String)
    # Relationships to child tables
    doctor_profile = relationship("Doctor", back_populates="staff_info", uselist=False)
    nurse_profile = relationship("Nurse", back_populates="staff_info", uselist=False)

# --- THE SPECIALIZED TABLES ---
class Doctor(Base):
    __tablename__ = "doctors"
    id = Column(Integer, primary_key=True, index=True)
    staff_ref_id = Column(Integer, ForeignKey("staff.id"))
    specialization = Column(String)
    license_no = Column(String, unique=True)
    is_hod = Column(Boolean, default=False)
    
    staff_info = relationship("Staff", back_populates="doctor_profile")

class Nurse(Base):
    __tablename__ = "nurses"
    id = Column(Integer, primary_key=True, index=True)
    staff_ref_id = Column(Integer, ForeignKey("staff.id"))
    shift_type = Column(String)
    ward_no = Column(String)
    
    staff_info = relationship("Staff", back_populates="nurse_profile")