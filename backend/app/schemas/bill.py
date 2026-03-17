from pydantic import BaseModel, Field
from datetime import datetime


class BillBase(BaseModel):
    bill_name: str = Field(..., min_length=1, description="Name of the bill")
    amount: float = Field(..., gt=0, description="Bill amount must be positive")
    due_date: str = Field(..., description="ISO date string YYYY-MM-DD")



class BillCreate(BillBase):
    user_id: int


class BillResponse(BillBase):
    id: int
    user_id: int
    status: str
    is_paid: bool = False
    category: str = "Bills"

    class Config:
        from_attributes = True

