from app.database import SessionLocal
from app.models import Bill, Reward
from datetime import datetime, timedelta
import sys
sys.path.insert(0, '.')

def seed_bills_rewards():
    db = SessionLocal()
    
    # Dummy bills for user 1
    bills_data = [
        {
            "user_id": 1,
            "bill_name": "Netflix",
            "amount": 499.0,
            "due_date": datetime.now() + timedelta(days=3),
            "is_paid": False,
            "category": "Entertainment"
        },
        {
            "user_id": 1,
            "bill_name": "Electricity Bill",
            "amount": 2500.0,
            "due_date": datetime.now() + timedelta(days=5),
            "is_paid": False,
            "category": "Utilities"
        },
        {
            "user_id": 1,
            "bill_name": "Rent",
            "amount": 25000.0,
            "due_date": datetime.now() + timedelta(days=1),
            "is_paid": True,
            "category": "Housing"
        },
        {
            "user_id": 1,
            "bill_name": "Credit Card",
            "amount": 3500.0,
            "due_date": datetime.now() - timedelta(days=2),
            "is_paid": False,
            "category": "Bills"
        }
    ]
    
    # Clear existing
    db.query(Bill).filter(Bill.user_id == 1).delete()
    db.commit()
    
    for data in bills_data:
        bill = Bill(**data)
        db.add(bill)
    
    db.commit()
    print("✅ Added 4 dummy bills")
    
    # Dummy rewards
    rewards_data = [
        {
            "user_id": 1,
            "points": 1250,
            "description": "HDFC Credit Card Rewards",
            "earned_date": datetime.now() - timedelta(days=10),
            "expires_date": datetime.now() + timedelta(days=365)
        },
        {
            "user_id": 1,
            "points": 850,
            "description": "Amazon Pay Rewards",
            "earned_date": datetime.now() - timedelta(days=25),
            "expires_date": datetime.now() + timedelta(days=365)
        },
        {
            "user_id": 1,
            "points": 300,
            "description": "Sign-up Bonus",
            "earned_date": datetime.now() - timedelta(days=45),
            "expires_date": datetime.now() + timedelta(days=180)
        }
    ]
    
    db.query(Reward).filter(Reward.user_id == 1).delete()
    db.commit()
    
    for data in rewards_data:
        reward = Reward(**data)
        db.add(reward)
    
    db.commit()
    print("✅ Added 3 dummy rewards")
    
    db.close()
    print("✅ Seeding complete! Refresh the app.")

if __name__ == "__main__":
    seed_bills_rewards()

