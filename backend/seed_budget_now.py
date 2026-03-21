from app.database import SessionLocal
from app.models import Budget
db = SessionLocal()

# Insert/update budgets for current month
current_month = '2024-10'
budgets = [
    {"category": "Food", "limit_amount": 10000.0, "spent_amount": 6500.0},
    {"category": "Shopping", "limit_amount": 8000.0, "spent_amount": 9500.0},
    {"category": "Entertainment", "limit_amount": 5000.0, "spent_amount": 3200.0},
    {"category": "Transport", "limit_amount": 4000.0, "spent_amount": 3800.0}
]

for b in budgets:
    db.query(Budget).filter(Budget.user_id == 1, Budget.category == b["category"], Budget.month == current_month).delete()
    budget = Budget(user_id=1, category=b["category"], limit_amount=b["limit_amount"], spent_amount=b["spent_amount"], month=current_month)
    db.add(budget)

db.commit()
print("✅ Budgets inserted for 2024-10")
db.close()

