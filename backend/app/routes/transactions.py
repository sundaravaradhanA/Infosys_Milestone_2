from fastapi import APIRouter, Depends, HTTPException, Query
from app.dependencies import get_current_user_id
from app.services.budget_service import BudgetService
from app.services.alert_service import AlertService
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Transaction, CategoryRule, Account
from app.schemas import TransactionCreate, TransactionResponse, TransactionUpdate
from app.services.currency_service import currency_service
from typing import Optional

router = APIRouter()

def auto_categorize_transaction(description: str, db: Session):
    """Automatically categorize transaction based on rules"""
    if not description:
        return None
    
    # Get all active rules ordered by priority (highest first)
    rules = db.query(CategoryRule).filter(
        CategoryRule.is_active == True
    ).order_by(CategoryRule.priority.desc()).all()
    
    description_lower = description.lower().strip()
    
    for rule in rules:
        # Check keyword pattern (exact match, case-insensitive)
        if rule.keyword_pattern and rule.keyword_pattern.lower() in description_lower:
            return rule.category
        # Check merchant pattern (partial match, case-insensitive)
        if rule.merchant_pattern and rule.merchant_pattern.lower() in description_lower:
            return rule.category
    
    return None

@router.get("/", response_model=list[TransactionResponse])
def get_transactions(
    user_id: int = Depends(get_current_user_id),
    account_id: Optional[int] = Query(None, description="Filter by account ID"),
    category: Optional[str] = Query(None, description="Filter by category"),
    skip: int = Query(0, description="Number of records to skip"),
    limit: int = Query(50, description="Max records to return"),
    db: Session = Depends(get_db)
):
    """Get all transactions for a user, optionally filtered with pagination"""
    # Get accounts for the user
    accounts = db.query(Account).filter(Account.user_id == user_id).all()
    account_ids = [a.id for a in accounts]
    
    if not account_ids:
        return []
    
    query = db.query(Transaction).filter(Transaction.account_id.in_(account_ids))
    
    if account_id:
        query = query.filter(Transaction.account_id == account_id)
    
    if category:
        query = query.filter(Transaction.category == category)
    
    # Apply pagination
    transactions = query.order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()
    
    rate = currency_service.get_usd_to_inr_rate()
    return [
        TransactionResponse(
            id=t.id,
            created_at=t.created_at,
            account_id=t.account_id,
            description=t.description,
            amount_usd=float(t.amount),
            category=t.category,
            currency=getattr(t, 'currency', 'USD'),
            amount_inr=currency_service.convert_usd_to_inr(float(t.amount)),
            usd_to_inr_rate=rate
        ) for t in transactions
    ]

@router.get("/count")
def get_transactions_count(
    user_id: int = Depends(get_current_user_id),
    account_id: Optional[int] = Query(None, description="Filter by account ID"),
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db)
):
    """Get total count of transactions for pagination"""
    # Get accounts for the user
    accounts = db.query(Account).filter(Account.user_id == user_id).all()
    account_ids = [a.id for a in accounts]
    
    if not account_ids:
        return {"total": 0}
    
    query = db.query(Transaction).filter(Transaction.account_id.in_(account_ids))
    
    if account_id:
        query = query.filter(Transaction.account_id == account_id)
    
    if category:
        query = query.filter(Transaction.category == category)
    
    total = query.count()
    return {"total": total}

@router.post("/", response_model=TransactionResponse)
def create_transaction(txn: TransactionCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    """Create a new transaction with auto-categorization and budget tracking"""
    # Verify account ownership
    account = db.query(Account).filter(Account.id == txn.account_id, Account.user_id == user_id).first()
    if not account:
        raise HTTPException(status_code=403, detail="Not authorized to add transaction to this account")

    category = txn.category
    if not category:
        category = auto_categorize_transaction(txn.description, db)
    
    new_txn = Transaction(
        account_id=txn.account_id,
        description=txn.description,
        amount=txn.amount_usd,
        category=category,
        currency=txn.currency
    )
    db.add(new_txn)
    
    try:
        db.commit()
        db.refresh(new_txn)
        
        # Update Budget and check alerts
        if category and txn.amount_usd < 0:
            month_str = new_txn.created_at.strftime('%Y-%m') if new_txn.created_at else datetime.now().strftime('%Y-%m')
            
            # Find budget
            from app.models.budget import Budget
            budget = db.query(Budget).filter(
                Budget.user_id == user_id,
                Budget.category == category,
                Budget.month == month_str
            ).first()
            
            if budget:
                budget_service = BudgetService(db)
                alert_service = AlertService(db)
                budget_service.recalculate_budget(budget.id, user_id)
                alert_service.check_budget_exceeded(budget.id, user_id)
                
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
        
    rate = currency_service.get_usd_to_inr_rate()
    return TransactionResponse(
        id=new_txn.id,
        created_at=new_txn.created_at,
        account_id=new_txn.account_id,
        description=new_txn.description,
        amount_usd=float(new_txn.amount),
        category=new_txn.category,
        currency=getattr(new_txn, 'currency', 'USD'),
        amount_inr=currency_service.convert_usd_to_inr(float(new_txn.amount)),
        usd_to_inr_rate=rate
    )

@router.put("/{transaction_id}/category", response_model=TransactionResponse)
def update_transaction_category(
    transaction_id: int,
    update_data: TransactionUpdate,
    save_as_rule: bool = Query(False, description="Save as new category rule"),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Update transaction category and trigger budget recalculation"""
    # Validate Ownership via Join
    txn = db.query(Transaction).join(Account).filter(
        Transaction.id == transaction_id,
        Account.user_id == user_id
    ).first()
    
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found or unauthorized")
    
    old_category = txn.category
    new_category = update_data.category
    
    if new_category is not None:
        txn.category = new_category
        
        if save_as_rule and txn.description:
            keyword = txn.description.split()[0] if txn.description else None
            if keyword:
                existing_rule = db.query(CategoryRule).filter(
                    CategoryRule.user_id == user_id,
                    CategoryRule.keyword_pattern.ilike(keyword)
                ).first()
                if not existing_rule:
                    new_rule = CategoryRule(
                        user_id=user_id,
                        category=new_category,
                        keyword_pattern=keyword,
                        priority=1,
                        is_active=True
                    )
                    db.add(new_rule)
    
    try:
        db.commit()
        db.refresh(txn)
        
        # Trigger Budget Recalculation
        month_str = txn.created_at.strftime('%Y-%m') if txn.created_at else datetime.now().strftime('%Y-%m')
        from app.models.budget import Budget
        budget_service = BudgetService(db)
        alert_service = AlertService(db)
        
        # Recalculate for both old and new category budgets if they exist
        for cat in set([old_category, new_category]):
            if cat:
                budget = db.query(Budget).filter(
                    Budget.user_id == user_id,
                    Budget.category == cat,
                    Budget.month == month_str
                ).first()
                if budget:
                    budget_service.recalculate_budget(budget.id, user_id)
                    alert_service.check_budget_exceeded(budget.id, user_id)

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
        
    rate = currency_service.get_usd_to_inr_rate()
    return TransactionResponse(
        id=txn.id,
        created_at=txn.created_at,
        account_id=txn.account_id,
        description=txn.description,
        amount_usd=float(txn.amount),
        category=txn.category,
        currency=getattr(txn, 'currency', 'USD'),
        amount_inr=currency_service.convert_usd_to_inr(float(txn.amount)),
        usd_to_inr_rate=rate
    )

@router.post("/categorize-all")
def categorize_all_transactions(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Apply auto-categorization to all uncategorized transactions"""
    # Get accounts for the user
    accounts = db.query(Account).filter(Account.user_id == user_id).all()
    account_ids = [a.id for a in accounts]
    
    if not account_ids:
        return {"message": "No accounts found"}
    
    transactions = db.query(Transaction).filter(
        Transaction.account_id.in_(account_ids),
        Transaction.category == None
    ).all()
    
    count = 0
    for txn in transactions:
        category = auto_categorize_transaction(txn.description, db)
        if category:
            txn.category = category
            count += 1
    
    db.commit()
    return {"message": f"Categorized {count} transactions"}

@router.get("/uncategorized")
def get_uncategorized_transactions(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get all uncategorized transactions"""
    # Get accounts for the user
    accounts = db.query(Account).filter(Account.user_id == user_id).all()
    account_ids = [a.id for a in accounts]
    
    if not account_ids:
        return []
    
    return db.query(Transaction).filter(
        Transaction.account_id.in_(account_ids),
        Transaction.category == None
    ).order_by(Transaction.created_at.desc()).all()
