import sys
sys.path.insert(0, '.')

from app.database import SessionLocal
from app.models import User, Account, Transaction, Budget, CategoryRule, Alert
from datetime import datetime, timedelta

def seed_all():
    db = SessionLocal()
    
    # Check if user 1 exists, if not create
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        user = User(
            id=1,
            name="Test User",
            email="test@example.com",
            password="password123",
            phone="1234567890",
            address="Test Address",
            kyc_status="Verified"
        )
        db.add(user)
        db.commit()
        print("✅ Created user 1")
    
    # Delete transactions first (due to foreign key)
    db.query(Transaction).filter(Transaction.account_id.in_([12, 13])).delete()
    db.commit()
    
    # Then delete accounts
    db.query(Account).filter(Account.user_id == 1).delete()
    db.commit()
    
    # Create accounts for user 1
    accounts = [
        Account(id=12, user_id=1, bank_name="State Bank", account_type="Savings", balance=150000.0),
        Account(id=13, user_id=1, bank_name="HDFC Bank", account_type="Current", balance=100000.0),
    ]
    
    # Add accounts
    for acc in accounts:
        db.add(acc)
    db.commit()
    print(f"✅ Added {len(accounts)} accounts")
    
    # Sample transactions for accounts 12 and 13
    transactions_data = [
        {"account_id": 12, "description": "Salary", "amount": 75000.0, "category": "Income"},
        {"account_id": 12, "description": "Zomato", "amount": -350.0, "category": "Food"},
        {"account_id": 12, "description": "Amazon", "amount": -1500.0, "category": "Shopping"},
        {"account_id": 12, "description": "Electricity", "amount": -1200.0, "category": "Bills"},
        {"account_id": 12, "description": "Uber", "amount": -180.0, "category": "Transport"},
        {"account_id": 12, "description": "Netflix", "amount": -499.0, "category": "Entertainment"},
        {"account_id": 13, "description": "Freelance", "amount": 25000.0, "category": "Income"},
        {"account_id": 13, "description": "Business", "amount": 50000.0, "category": "Income"},
        {"account_id": 13, "description": "Vendor Payment", "amount": -12000.0, "category": "Shopping"},
    ]
    
    # Add transactions
    for txn_data in transactions_data:
        txn = Transaction(
            account_id=txn_data["account_id"],
            description=txn_data["description"],
            amount=txn_data["amount"],
            category=txn_data["category"]
        )
        db.add(txn)
    db.commit()
    print(f"✅ Added {len(transactions_data)} transactions")
    
    # Sample budgets
    budgets_data = [
        {"category": "Food", "limit_amount": 5000, "month": "2026-03"},
        {"category": "Shopping", "limit_amount": 15000, "month": "2026-03"},
        {"category": "Bills", "limit_amount": 8000, "month": "2026-03"},
        {"category": "Transport", "limit_amount": 5000, "month": "2026-03"},
    ]
    
    db.query(Budget).filter(Budget.user_id == 1).delete()
    for b in budgets_data:
        budget = Budget(
            user_id=1,
            category=b["category"],
            limit_amount=b["limit_amount"],
            spent_amount=0,
            month=b["month"]
        )
        db.add(budget)
    db.commit()
    print(f"✅ Added {len(budgets_data)} budgets")
    
    # Sample alerts
    alerts_data = [
        {"title": "Welcome", "message": "Welcome to Banking App!", "alert_type": "info"},
    ]
    
    db.query(Alert).filter(Alert.user_id == 1).delete()
    for a in alerts_data:
        alert = Alert(
            user_id=1,
            title=a["title"],
            message=a["message"],
            alert_type=a["alert_type"],
            is_read=False
        )
        db.add(alert)
    db.commit()
    print(f"✅ Added {len(alerts_data)} alerts")
    
    db.close()
    print("\n✅ All seeding completed!")

if __name__ == "__main__":
    seed_all()
