from pydantic import BaseModel

class UserBase(BaseModel):
    name: str
    email: str
    phone: str
    address: str = ""
    kyc_status: str = "Pending"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    kyc_status: str | None = None

class UserResponse(UserBase):
    id: int
    
    class Config:
        from_attributes = True

