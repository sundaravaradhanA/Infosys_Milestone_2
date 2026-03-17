import sys
sys.path.insert(0, '.')
from app.database import SessionLocal
from app.models import User, Account

db = SessionLocal()

# Check if user 1 exists
existing = db.query(User).filter(User.id == 1).first()
if existing:
    print('User 1 already exists')
else:
    # Create user
    user = User(
        id=1,
        name='Test User',
        email='test@example.com',
        password='password123',
        phone='+91 9876543210',
        address='123 Main Street, Mumbai, Maharashtra',
        kyc_status='Verified'
    )
    db.add(user)
    db.commit()
    print('Created user 1')

# Create accounts
acc12 = db.query(Account).filter(Account.id == 12).first()
if not acc12:
    acc12 = Account(id=12, user_id=1, bank_name='HDFC Bank', account_type='Savings', balance=150000.0)
    db.add(acc12)
    print('Created account 12')

acc13 = db.query(Account).filter(Account.id == 13).first()
if not acc13:
    acc13 = Account(id=13, user_id=1, bank_name='ICICI Bank', account_type='Current', balance=75000.0)
    db.add(acc13)
    print('Created account 13')

db.commit()
db.close()
print('Done!')

