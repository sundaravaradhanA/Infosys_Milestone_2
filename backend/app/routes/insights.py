from fastapi import APIRouter, Depends, Query
from app.dependencies import get_current_user_id
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import datetime
from app.database import get_db
from app.models import Transaction, Account, Budget

from app.services.currency_service import currency_service
router = APIRouter()

@router.get("/spending-by-category")
def get_spending_by_category(
    user_id: int = Depends(get_current_user_id),
    month: Optional[str] = Query(None, description="Month in YYYY-MM format"),
    db: Session = Depends(get_db)
):
    """Get spending by category for a user, optionally filtered by month"""
    # Get accounts for the user
    accounts = db.query(Account).filter(Account.user_id == user_id).all()
    account_ids = [a.id for a in accounts]
    
    if not account_ids:
        return []
    
    # Base query for transactions - expenses are negative amounts
    query = db.query(
        Transaction.category,
        func.sum(func.abs(Transaction.amount)).label('amount')
    ).filter(
        Transaction.account_id.in_(account_ids),
        Transaction.amount < 0  # Expenses (negative amounts)
    )
    
    # Filter by month if provided
    if month:
        query = query.filter(func.to_char(Transaction.created_at, 'YYYY-MM') == month)
    
    # Group by category
    results = query.group_by(Transaction.category).all()
    
    return [
        {
            "category": r.category or "Uncategorized", 
            "amount": float(r.amount),
            "amount_inr": currency_service.convert_usd_to_inr(float(r.amount))
        }
        for r in results
    ]

@router.get("/income-by-category")
def get_income_by_category(
    user_id: int = Depends(get_current_user_id),
    month: Optional[str] = Query(None, description="Month in YYYY-MM format"),
    db: Session = Depends(get_db)
):
    """Get income by category for a user, optionally filtered by month"""
    # Get accounts for the user
    accounts = db.query(Account).filter(Account.user_id == user_id).all()
    account_ids = [a.id for a in accounts]
    
    if not account_ids:
        return []
    
    # Base query for transactions - income are positive amounts
    query = db.query(
        Transaction.category,
        func.sum(Transaction.amount).label('amount')
    ).filter(
        Transaction.account_id.in_(account_ids),
        Transaction.amount > 0  # Income (positive amounts)
    )
    
    # Filter by month if provided
    if month:
        query = query.filter(func.to_char(Transaction.created_at, 'YYYY-MM') == month)
    
    # Group by category
    results = query.group_by(Transaction.category).all()
    
    return [
        {
            "category": r.category or "Uncategorized", 
            "amount": float(r.amount),
            "amount_inr": currency_service.convert_usd_to_inr(float(r.amount))
        }
        for r in results
    ]

@router.get("/monthly-summary")
def get_monthly_summary(
    user_id: int = Depends(get_current_user_id),
    month: Optional[str] = Query(None, description="Month in YYYY-MM format"),
    db: Session = Depends(get_db)
):
    """Get monthly summary including total income, expenses, and balance"""
    # Get accounts for the user
    accounts = db.query(Account).filter(Account.user_id == user_id).all()
    account_ids = [a.id for a in accounts]
    
    if not account_ids:
        return {"total_income": 0, "total_expense": 0, "balance": 0}
    
    # Get total income (positive amounts)
    income_query = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.account_id.in_(account_ids),
        Transaction.amount > 0
    )
    
    # Get total expenses (negative amounts)
    expense_query = db.query(func.coalesce(func.sum(func.abs(Transaction.amount)), 0)).filter(
        Transaction.account_id.in_(account_ids),
        Transaction.amount < 0
    )
    
    # Filter by month if provided
    if month:
        income_query = income_query.filter(func.to_char(Transaction.created_at, 'YYYY-MM') == month)
        expense_query = expense_query.filter(func.to_char(Transaction.created_at, 'YYYY-MM') == month)
    
    total_income = float(income_query.scalar() or 0)
    total_expense = float(expense_query.scalar() or 0)
    
    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": total_income - total_expense,
        "total_income_inr": currency_service.convert_usd_to_inr(total_income),
        "total_expense_inr": currency_service.convert_usd_to_inr(total_expense),
        "balance_inr": currency_service.convert_usd_to_inr(total_income - total_expense),
        "exchange_rate": currency_service.get_usd_to_inr_rate(),
        "month": month
    }

@router.get("/category-trend")
def get_category_trend(
    user_id: int = Depends(get_current_user_id),
    category: str = Query(..., description="Category to get trend for"),
    months: int = Query(6, description="Number of months to look back"),
    db: Session = Depends(get_db)
):
    """Get spending trend for a specific category over time"""
    # Get accounts for the user
    accounts = db.query(Account).filter(Account.user_id == user_id).all()
    account_ids = [a.id for a in accounts]
    
    if not account_ids:
        return []
    
    # Get spending by month for the category (expenses are negative)
    results = db.query(
        func.to_char(Transaction.created_at, 'YYYY-MM').label('month'),
        func.sum(func.abs(Transaction.amount)).label('amount')
    ).filter(
        Transaction.account_id.in_(account_ids),
        Transaction.category == category,
        Transaction.amount < 0
    ).group_by(
        func.to_char(Transaction.created_at, 'YYYY-MM')
    ).order_by(
        func.to_char(Transaction.created_at, 'YYYY-MM').desc()
    ).limit(months).all()
    
    return [
        {"month": r.month, "amount": float(r.amount)}
        for r in results
    ]

@router.get("/transactions-by-date")
def get_transactions_by_date(
    user_id: int = Depends(get_current_user_id),
    month: Optional[str] = Query(None, description="Month in YYYY-MM format"),
    db: Session = Depends(get_db)
):
    """Get all transactions grouped by date for a month"""
    # Get accounts for the user
    accounts = db.query(Account).filter(Account.user_id == user_id).all()
    account_ids = [a.id for a in accounts]
    
    if not account_ids:
        return []
    
    # Base query for transactions
    query = db.query(Transaction).filter(
        Transaction.account_id.in_(account_ids)
    )
    
    # Filter by month if provided
    if month:
        query = query.filter(func.to_char(Transaction.created_at, 'YYYY-MM') == month)
    
    transactions = query.order_by(Transaction.created_at.desc()).all()
    
    # Group by date
    transactions_by_date = {}
    for txn in transactions:
        date_str = txn.created_at.strftime('%Y-%m-%d')
        if date_str not in transactions_by_date:
            transactions_by_date[date_str] = []
        transactions_by_date[date_str].append({
            "id": txn.id,
            "description": txn.description,
            "category": txn.category or "Uncategorized",
            "amount": float(txn.amount),
            "created_at": txn.created_at.isoformat()
        })
    
    return transactions_by_date

@router.get("/top-merchants")
def get_top_merchants(
    user_id: int = Depends(get_current_user_id),
    limit: int = Query(10),
    month: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Top 10 merchants by spending amount"""
    accounts = db.query(Account).filter(Account.user_id == user_id).all()
    account_ids = [a.id for a in accounts]
    if not account_ids:
        return []
    
    query = db.query(
        Transaction.description.label('merchant'),
        func.sum(func.abs(Transaction.amount)).label('total_spent')
    ).filter(
        Transaction.account_id.in_(account_ids),
        Transaction.amount < 0,
        Transaction.description.isnot(None)
    ).group_by(Transaction.description).order_by(func.sum(func.abs(Transaction.amount)).desc())
    
    if month:
        query = query.filter(func.to_char(Transaction.created_at, 'YYYY-MM') == month)
    
    results = query.limit(limit).all()
    return [
        {
            "merchant": r.merchant or "Unknown", 
            "total_spent": float(r.total_spent),
            "total_spent_inr": currency_service.convert_usd_to_inr(float(r.total_spent))
        } 
        for r in results
    ]

@router.get("/burn-rate")
def get_burn_rate(
    user_id: int = Depends(get_current_user_id),
    month: Optional[str] = Query(None, description="Month in YYYY-MM format"),
    db: Session = Depends(get_db)
):
    """Budget burn rate: % of budget used for overall and per category"""
    # Filter budgets by user and optionally by month
    budget_query = db.query(Budget).filter(Budget.user_id == user_id)
    if month:
        budget_query = budget_query.filter(Budget.month == month)
    
    budgets = budget_query.all()
    if not budgets:
        return {
            "total_budget": 0,
            "total_spent": 0,
            "used_percent": 0,
            "projected_monthly": 0,
            "burn_rate_percent": 0,
            "categories": []
        }
    
    total_limit = sum(b.limit_amount or 0 for b in budgets)
    total_spent = sum(b.spent_amount or 0 for b in budgets)
    
    # Cap used_percent at 100 as per user request
    raw_used_percent = (float(total_spent) / float(total_limit) * 100) if total_limit > 0 else 0
    used_percent = min(raw_used_percent, 100)
    
    # Category-wise burn rates
    category_burn = []
    for b in budgets:
        cat_limit = float(b.limit_amount or 0)
        cat_spent = float(b.spent_amount or 0)
        cat_pct = (cat_spent / cat_limit * 100) if cat_limit > 0 else 0
        category_burn.append({
            "category": b.category or "Unknown",
            "limit": cat_limit,
            "spent": cat_spent,
            "limit_inr": currency_service.convert_usd_to_inr(cat_limit),
            "spent_inr": currency_service.convert_usd_to_inr(cat_spent),
            "used_percent": round(min(cat_pct, 100), 2)
        })
    
    # Days used estimate
    now = datetime.now()
    if month and month != now.strftime("%Y-%m"):
        projected = float(total_spent)
        burn_rate_percent = used_percent
    else:
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        days_passed = (now - month_start).days
        projected = (float(total_spent) / days_passed * 30) if days_passed > 0 else float(total_spent)
        burn_rate_percent = min(projected / float(total_limit) * 100, 100) if total_limit > 0 else 0
    
    return {
        "total_budget": float(total_limit),
        "total_spent": float(total_spent),
        "total_budget_inr": currency_service.convert_usd_to_inr(float(total_limit)),
        "total_spent_inr": currency_service.convert_usd_to_inr(float(total_spent)),
        "used_percent": round(float(used_percent), 2),
        "projected_monthly": float(projected),
        "projected_monthly_inr": currency_service.convert_usd_to_inr(float(projected)),
        "burn_rate_percent": round(float(burn_rate_percent), 2),
        "categories": category_burn
    }

# Aliases for Insights Dashboard
@router.get("/category-spend")
def get_category_spend_alias(
    user_id: int = Depends(get_current_user_id),
    month: Optional[str] = Query(None, description="Month in YYYY-MM format"),
    db: Session = Depends(get_db)
):
    return get_spending_by_category(user_id=user_id, month=month, db=db)

@router.get("/cashflow")
def get_cashflow_alias(
    user_id: int = Depends(get_current_user_id),
    month: Optional[str] = Query(None, description="Month in YYYY-MM format"),
    db: Session = Depends(get_db)
):
    return get_monthly_summary(user_id=user_id, month=month, db=db)
