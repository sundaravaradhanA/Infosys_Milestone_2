from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional

class BillBase(BaseModel):
    biller_name: str = Field(..., min_length=1, description="Name of the biller")
    amount_due: float = Field(..., gt=0, description="Amount due in numeric")
    due_date: date = Field(..., description="Due date of the bill YYYY-MM-DD")
    auto_pay: bool = Field(default=False, description="Enable auto pay")

class BillCreate(BillBase):
    pass

class BillUpdate(BaseModel):
    biller_name: Optional[str] = None
    amount_due: Optional[float] = None
    due_date: Optional[date] = None
    auto_pay: Optional[bool] = None
    status: Optional[str] = None # allowed: upcoming, paid, overdue

class BillResponse(BillBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True
