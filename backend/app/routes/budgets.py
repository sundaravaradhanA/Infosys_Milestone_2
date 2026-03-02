from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.database import get_db
from app.models import Budget, Transaction, Account, Alert
from app.schemas import BudgetCreate, BudgetResponse, BudgetUpdate
from app.schemas.budget import BudgetWithProgress

router = APIRouter()

@router.get("/", response_model=list[BudgetWithProgress])
def get_budgets(
    user_id: int = Query(1, description="User ID"),
    month: Optional[str] = Query(None, description="Month in YYYY-MM format"),
    db: Session = Depends(get_db)
):
    """Get all budgets for a user, optionally filtered by month"""
    query = db.query(Budget).filter(Budget.user_id == user_id)
    
    if month:
        query = query.filter(Budget.month == month)
    
    budgets = query.all()
    
    # Calculate spending and progress for each budget
    result = []
    for budget in budgets:
        # Get accounts for this user
        accounts = db.query(Account).filter(Account.user_id == user_id).all()
        account_ids = [a.id for a in accounts]
        
        if not account_ids:
            budget_with_progress = BudgetWithProgress(
                id=budget.id,
                user_id=budget.user_id,
                category=budget.category,
                limit_amount=budget.limit_amount,
                spent_amount=0,
                month=budget.month,
                progress_percentage=0,
                is_over_budget=False,
                remaining_amount=budget.limit_amount
            )
            result.append(budget_with_progress)
            continue
        
        # Build the query for spent amount - only debit/negative amounts
        spent_query = db.query(func.coalesce(func.sum(func.abs(Transaction.amount)), 0)).filter(
            Transaction.account_id.in_(account_ids),
            Transaction.category == budget.category,
            Transaction.amount < 0  # Only count expenses (negative amounts)
        )
        
        # Apply month filter properly - use budget's month or the requested month
        filter_month = month if month else budget.month
        if filter_month:
            spent_query = spent_query.filter(
                func.to_char(Transaction.created_at, 'YYYY-MM') == filter_month
            )
        
        spent = spent_query.scalar() or 0
        
        # Calculate progress
        limit_amount = float(budget.limit_amount) if budget.limit_amount else 0
        spent_amount = float(spent) if spent else 0
        
        if limit_amount > 0:
            progress_percentage = (spent_amount / limit_amount) * 100
        else:
            progress_percentage = 0
        
        is_over_budget = spent_amount > limit_amount
        remaining_amount = limit_amount - spent_amount
        
        # Check for overspending and create alert if needed
        if is_over_budget:
            # Check if alert already exists for this month
            existing_alert = db.query(Alert).filter(
                Alert.user_id == user_id,
                Alert.alert_type == "budget_exceeded",
                Alert.title.like(f"%{budget.category}%"),
                Alert.title.like(f"%{filter_month}%") if filter_month else True
            ).first()
            
            if not existing_alert:
                new_alert = Alert(
                    user_id=user_id,
                    title=f"Budget Exceeded: {budget.category} - {filter_month}",
                    message=f"You've exceeded your monthly budget for {budget.category}. Spent: ₹{spent_amount:.2f}, Limit: ₹{limit_amount:.2f}",
                    alert_type="budget_exceeded"
                )
                db.add(new_alert)
                db.commit()
        
        budget_with_progress = BudgetWithProgress(
            id=budget.id,
            user_id=budget.user_id,
            category=budget.category,
            limit_amount=limit_amount,
            spent_amount=spent_amount,
            month=budget.month,
            progress_percentage=round(progress_percentage, 2),
            is_over_budget=is_over_budget,
            remaining_amount=round(remaining_amount, 2)
        )
        result.append(budget_with_progress)
    
    return result

@router.post("/", response_model=BudgetResponse)
def create_budget(budget: BudgetCreate, db: Session = Depends(get_db)):
    """Create a new budget"""
    # Check if budget already exists for this category and month
    existing = db.query(Budget).filter(
        Budget.user_id == budget.user_id,
        Budget.category == budget.category,
        Budget.month == budget.month
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Budget already exists for this category and month")
    
    new_budget = Budget(
        user_id=budget.user_id,
        category=budget.category,
        limit_amount=budget.limit_amount,
        spent_amount=0,
        month=budget.month
    )
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)
    return new_budget

@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(budget_id: int, budget: BudgetUpdate, user_id: int = Query(1), db: Session = Depends(get_db)):
    """Update an existing budget"""
    db_budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == user_id
    ).first()
    
    if not db_budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    if budget.category is not None:
        db_budget.category = budget.category
    if budget.limit_amount is not None:
        db_budget.limit_amount = budget.limit_amount
    if budget.month is not None:
        db_budget.month = budget.month
    
    db.commit()
    db.refresh(db_budget)
    return db_budget

@router.delete("/{budget_id}")
def delete_budget(budget_id: int, user_id: int = Query(1), db: Session = Depends(get_db)):
    """Delete a budget"""
    db_budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == user_id
    ).first()
    
    if not db_budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    db.delete(db_budget)
    db.commit()
    return {"message": "Budget deleted successfully"}

@router.post("/recalculate")
def recalculate_budgets(user_id: int = Query(1), month: Optional[str] = None, db: Session = Depends(get_db)):
    """Recalculate all budget spending for a user"""
    budgets = db.query(Budget).filter(Budget.user_id == user_id).all()
    
    if month:
        budgets = [b for b in budgets if b.month == month]
    
    updated = 0
    for budget in budgets:
        accounts = db.query(Account).filter(Account.user_id == user_id).all()
        account_ids = [a.id for a in accounts]
        
        if not account_ids:
            continue
        
        spent = db.query(func.coalesce(func.sum(func.abs(Transaction.amount)), 0)).filter(
            Transaction.account_id.in_(account_ids),
            Transaction.category == budget.category,
            Transaction.amount < 0,
            func.to_char(Transaction.created_at, 'YYYY-MM') == budget.month
        ).scalar() or 0
        
        budget.spent_amount = float(spent)
        db.commit()
        updated += 1
    
    return {"message": f"Recalculated {updated} budgets"}
