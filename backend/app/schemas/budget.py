from pydantic import BaseModel
from typing import Optional

class BudgetBase(BaseModel):
    category: str
    limit_amount_usd: float
    month: str

class BudgetCreate(BudgetBase):
    user_id: int

class BudgetUpdate(BaseModel):
    category: Optional[str] = None
    limit_amount_usd: Optional[float] = None
    month: Optional[str] = None

class BudgetResponse(BudgetBase):
    id: int
    user_id: int
    currency: str = "USD"
    limit_amount_inr: float = 0.0
    spent_amount_inr: float = 0.0
    usd_to_inr_rate: float = 83.0
    spent_amount: float
    
    class Config:
        from_attributes = True

class BudgetWithProgress(BudgetResponse):
    """Budget response with progress information"""
    progress_percentage: float = 0.0
    is_over_budget: bool = False
    remaining_amount: float = 0.0
    
    class Config:
        from_attributes = True
