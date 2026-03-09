from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional

class OrganizationBase(BaseModel):
    name: str
    gstin: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationOut(OrganizationBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True # Matches your UserInfo config