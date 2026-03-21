from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Account
from app.schemas import AccountCreate, AccountResponse
from app.services.currency_service import currency_service
from pydantic import BaseModel

router = APIRouter()

# Transfer schema
class TransferRequest(BaseModel):
    from_account_id: int
    to_account_id: int
    amount: float

@router.get("/", response_model=list[AccountResponse])
def get_accounts(
    user_id: int = Query(1, description="User ID"),
    db: Session = Depends(get_db)
):
    """Get all accounts for a user"""
    accounts = db.query(Account).filter(Account.user_id == user_id).all()
    rate = currency_service.get_usd_to_inr_rate()
    return [
        AccountResponse(
            id=a.id,
            user_id=a.user_id,
            bank_name=a.bank_name,
            account_type=a.account_type,
            balance_usd=float(a.balance),
            currency=getattr(a, 'currency', 'USD'),
            balance_inr=currency_service.convert_usd_to_inr(float(a.balance)),
            usd_to_inr_rate=rate
        ) for a in accounts
    ]

@router.post("/", response_model=AccountResponse)
def create_account(account: AccountCreate, db: Session = Depends(get_db)):
    """Create a new account"""
    new_account = Account(
        user_id=account.user_id,
        bank_name=account.bank_name,
        account_type=account.account_type,
        balance=account.balance_usd,
        currency='USD'
    )
    db.add(new_account)
    db.commit()
    db.refresh(new_account)
    return new_account

@router.get("/{account_id}", response_model=AccountResponse)
def get_account(
    account_id: int,
    user_id: int = Query(1),
    db: Session = Depends(get_db)
):
    """Get a specific account"""
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == user_id
    ).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    return account

@router.post("/transfer")
def transfer_between_accounts(
    transfer: TransferRequest,
    user_id: int = Query(1),
    db: Session = Depends(get_db)
):
    """Transfer money between accounts"""
    # Get source account
    from_account = db.query(Account).filter(
        Account.id == transfer.from_account_id,
        Account.user_id == user_id
    ).first()
    
    if not from_account:
        raise HTTPException(status_code=404, detail="Source account not found")
    
    # Get destination account
    to_account = db.query(Account).filter(
        Account.id == transfer.to_account_id,
        Account.user_id == user_id
    ).first()
    
    if not to_account:
        raise HTTPException(status_code=404, detail="Destination account not found")
    
    # Check sufficient balance
    if from_account.balance < transfer.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    # Perform transfer
    from_account.balance -= transfer.amount
    to_account.balance += transfer.amount
    
    db.commit()
    db.refresh(from_account)
    db.refresh(to_account)
    
    return {
        "message": "Transfer successful",
        "from_account": from_account,
        "to_account": to_account
    }

@router.delete("/{account_id}")
def delete_account(
    account_id: int,
    user_id: int = Query(1),
    db: Session = Depends(get_db)
):
    """Delete an account"""
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == user_id
    ).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    db.delete(account)
    db.commit()
    return {"message": "Account deleted successfully"}
