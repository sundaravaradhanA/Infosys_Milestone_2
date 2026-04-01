from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = ""
    kyc_status: str = "Pending"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    kyc_status: Optional[str] = None

class UserResponse(UserBase):
    id: int
    
    class Config:
        from_attributes = True
