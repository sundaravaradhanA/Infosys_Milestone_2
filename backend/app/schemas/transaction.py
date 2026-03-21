from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TransactionBase(BaseModel):
    account_id: int
    description: str
    amount_usd: float
    category: Optional[str] = None
    currency: str = "USD"

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    category: Optional[str] = None

class TransactionResponse(TransactionBase):
    id: int
    created_at: datetime
    currency: str
    amount_inr: float
    usd_to_inr_rate: float
    
    class Config:
        from_attributes = True
