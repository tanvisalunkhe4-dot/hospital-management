from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base
import datetime

class Hospital(Base):
    __tablename__ = "hospitals"
    id = Column(Integer, primary_key=True, index=True)
    hfr_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    admin_email = Column(String, unique=True, nullable=False)
    
    # --- New Fields to add ---
    phone = Column(String, nullable=True)
    category = Column(String, nullable=True) # e.g., General, Dental
    facility_type = Column(String, nullable=True) # e.g., Private, Govt
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    bed_capacity = Column(Integer, default=0)
    # -------------------------

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    users = relationship("User", back_populates="hospital")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    staff_id = Column(String, index=True, nullable=True) # Assigned by Admin to Doctors/Nurses
    phone = Column(String, index=True, nullable=True) # Primary for Patients
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False) # 'Admin', 'Staff', 'Patient'
    sub_role = Column(String, nullable=True) # 'Doctor', 'Nurse', 'Receptionist'
    
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    is_active = Column(Boolean, default=True)

    hospital = relationship("Hospital", back_populates="users")
    patient_profile = relationship("Patient", back_populates="user", uselist=False)

class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    abha_id = Column(String, unique=True, index=True)
    user = relationship("User", back_populates="patient_profile")
    
