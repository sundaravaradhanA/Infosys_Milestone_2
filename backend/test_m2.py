import pytest
from app.services.rule_engine import RuleEngine
from app.services.budget_service import BudgetService
from app.services.alert_service import AlertService
from app.models import CategoryRule, Transaction, Budget, Alert, User, Account
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from decimal import Decimal

# Setup in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture()
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    # Create a dummy user and account for foreign key integrity
    user = User(id=1, name="Test User", email="test@example.com", password="password")
    account = Account(id=1, user_id=1, bank_name="Test Bank", balance=1000.0)
    db.add(user)
    db.add(account)
    db.commit()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

def test_rule_matching_priority(db: Session):
    # Rule 1: High priority
    rule1 = CategoryRule(user_id=1, keyword_pattern="STARBUCKS", category="Food & Dining", priority=100, is_active=True)
    # Rule 2: Low priority
    rule2 = CategoryRule(user_id=1, keyword_pattern="STARBUCKS COFFEE", category="Cafeteria", priority=10, is_active=True)
    db.add(rule1)
    db.add(rule2)
    db.commit()

    engine = RuleEngine(db)
    category = engine.match_rule("STARBUCKS COFFEE", user_id=1)
    # Should match Rule 1 because it has higher priority
    assert category == "Food & Dining"

def test_case_insensitive_matching(db: Session):
    rule = CategoryRule(user_id=1, keyword_pattern="uber eats", category="Food & Dining", priority=50, is_active=True)
    db.add(rule)
    db.commit()

    engine = RuleEngine(db)
    # Should match regardless of case
    category = engine.match_rule("UBER EATS", user_id=1)
    assert category == "Food & Dining"

def test_no_match_returns_default(db: Session):
    engine = RuleEngine(db)
    # No rules exist, should return "Uncategorized"
    category = engine.match_rule("Unknown charge", user_id=1)
    assert category == "Uncategorized"

def test_budget_aggregation_correctness(db: Session):
    # Setup Budget
    budget = Budget(user_id=1, category="Food", limit_amount=Decimal("100.00"), month="2024-05")
    db.add(budget)
    db.commit()

    # Add transactions
    # t1: Debit (included)
    t1 = Transaction(account_id=1, description="Lunch", amount=Decimal("-40.00"), category="Food", created_at=datetime(2024, 5, 10))
    # t2: Debit (included)
    t2 = Transaction(account_id=1, description="Dinner", amount=Decimal("-30.00"), category="Food", created_at=datetime(2024, 5, 12))
    # t3: Credit (excluded)
    t3 = Transaction(account_id=1, description="Refund", amount=Decimal("20.00"), category="Food", created_at=datetime(2024, 5, 15))
    db.add_all([t1, t2, t3])
    db.commit()

    b_service = BudgetService(db)
    b_service.recalculate_budget(budget.id, 1)

    db.refresh(budget)
    # Abs(-40 + -30) = 70. Credits are ignored as per implementation verify.
    assert float(budget.spent_amount) == 70.0
    
    # Verify progress calculation
    progress = b_service.calculate_progress_percentage(float(budget.spent_amount), float(budget.limit_amount))
    assert progress == 70.0

def test_overspending_alert_creation_duplicate_prevention(db: Session):
    alert_service = AlertService(db)
    # Budget overspent
    budget = Budget(user_id=1, category="Shopping", limit_amount=Decimal("50.00"), spent_amount=Decimal("60.00"), month="2024-05")
    db.add(budget)
    db.commit()

    # Check for alerts
    alert_service.check_budget_exceeded(budget.id, 1)
    
    # Verify exactly 1 alert exists
    alerts = db.query(Alert).filter(Alert.user_id == 1, Alert.alert_type == "budget_exceeded").all()
    assert len(alerts) == 1

    # Call it again and verify no extra alert is created (idempotent)
    alert_service.check_budget_exceeded(budget.id, 1)
    alerts_after = db.query(Alert).filter(Alert.user_id == 1, Alert.alert_type == "budget_exceeded").all()
    assert len(alerts_after) == 1
