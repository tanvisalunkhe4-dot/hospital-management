import uuid
import datetime
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False)
    gstin = Column(String, unique=True, index=True, nullable=True) 
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # This 'back_populates' MUST match the attribute name 'organization' in User
    users = relationship("User", back_populates="organization")