from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class RewardBase(BaseModel):
    program_name: str
    points_balance: int = 0

class RewardCreate(RewardBase):
    pass

class RewardUpdate(BaseModel):
    program_name: Optional[str] = None
    points_balance: Optional[int] = None

class RewardResponse(RewardBase):
    id: int
    user_id: int
    last_updated: datetime

    class Config:
        from_attributes = True
