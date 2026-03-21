from pydantic import BaseModel

class AccountBase(BaseModel):
    bank_name: str
    account_type: str
    balance_usd: float

class AccountCreate(AccountBase):
    user_id: int

class AccountResponse(AccountBase):
    id: int
    user_id: int
    currency: str
    balance_inr: float
    usd_to_inr_rate: float
    
    class Config:
        from_attributes = True
