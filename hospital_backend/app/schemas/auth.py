from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID

# This class must exist for the import to work
class SignupRequest(BaseModel):
    organization_name: str
    admin_name: str
    admin_email: EmailStr
    password: str

# Keep your other schemas here as well
class UserInfo(BaseModel):
    name: str
    email: str
    role: str
    organization_id: UUID = Field(validation_alias="org_id") 

    class Config:
        from_attributes = True
        populate_by_name = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserInfo