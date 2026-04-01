import os

def update_transactions_logic():
    filepath = r"d:\Infosys_Milestone_2\backend\app\routes\transactions.py"
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add necessary imports
    if "from app.services.budget_service import BudgetService" not in content:
        content = content.replace(
            "from app.dependencies import get_current_user_id",
            "from app.dependencies import get_current_user_id\nfrom app.services.budget_service import BudgetService\nfrom app.services.alert_service import AlertService\nfrom datetime import datetime"
        )
    
    # 1. Update create_transaction
    # Original:
    # def create_transaction(txn: TransactionCreate, db: Session = Depends(get_db)):
    # ...
    # db.add(new_txn)
    # db.commit()
    # db.refresh(new_txn)
    # return new_txn

    old_create = """def create_transaction(txn: TransactionCreate, db: Session = Depends(get_db)):
    \"\"\"Create a new transaction with auto-categorization\"\"\"
    # Auto-categorize if no category provided
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
    db.commit()
    db.refresh(new_txn)
    return new_txn"""

    new_create = """def create_transaction(txn: TransactionCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    \"\"\"Create a new transaction with auto-categorization and budget tracking\"\"\"
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
        
    return new_txn"""

    content = content.replace(old_create, new_create)

    # 2. Update update_transaction_category
    old_update = """def update_transaction_category(
    transaction_id: int,
    update_data: TransactionUpdate,
    save_as_rule: bool = False,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):"""
    # Wait, in the previously written code, `save_as_rule: bool = Query(...)`
    # We will just replace from `def update_transaction_category(` up to `return txn`
    import re
    # Match the whole function update_transaction_category
    match = re.search(r'(def update_transaction_category\(.*?(return txn|return new_txn))', content, re.DOTALL)
    if match:
        old_update_fn = match.group(1)
        
        new_update_fn = """def update_transaction_category(
    transaction_id: int,
    update_data: TransactionUpdate,
    save_as_rule: bool = Query(False, description="Save as new category rule"),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    \"\"\"Update transaction category and trigger budget recalculation\"\"\"
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
        
    return txn"""

        content = content.replace(old_update_fn, new_update_fn)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

update_transactions_logic()
print("Transactions logic updated.")
