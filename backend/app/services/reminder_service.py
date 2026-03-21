from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
import logging
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.bill import Bill
from app.models.alert import Alert
from app.models.account import Account
from app.models.user import User

logger = logging.getLogger(__name__)

def check_upcoming_bills():
    db: Session = SessionLocal()
    try:
        today = datetime.utcnow()
        reminder_date = today + timedelta(days=5)

        bills = db.query(Bill).filter(
            Bill.due_date <= reminder_date,
            Bill.is_paid == False
        ).all()

        for bill in bills:
            # Check if alert already exists recently
            existing = db.query(Alert).filter(
                Alert.user_id == bill.user_id,
                Alert.alert_type == "bill_due",
                Alert.title.like(f"%{bill.bill_name}%")
            ).first()
            if existing:
                continue

            alert = Alert(
                user_id=bill.user_id,
                title=f"Bill Due: {bill.bill_name}",
                message=f"Your {bill.bill_name} bill for ${bill.amount} is due on {bill.due_date.date()}",
                alert_type="bill_due",
                is_read=False
            )
            db.add(alert)
            logger.info(f"Created bill alert: {bill.bill_name}")
        db.commit()
    finally:
        db.close()

def check_low_balance():
    db: Session = SessionLocal()
    try:
        # Check all accounts with balance less than threshold
        THRESHOLD = 2000 # Warning balance limit
        accounts = db.query(Account).filter(Account.balance < THRESHOLD).all()
        
        for acc in accounts:
            existing = db.query(Alert).filter(
                Alert.user_id == acc.user_id,
                Alert.alert_type == "low_balance",
                Alert.title.like(f"%{acc.bank_name}%"),
                Alert.created_at >= datetime.utcnow() - timedelta(days=2) # Only alert every 2 days
            ).first()
            if existing:
                continue

            alert = Alert(
                user_id=acc.user_id,
                title=f"Low Balance: {acc.bank_name}",
                message=f"Your {acc.bank_name} account has a low balance of ${acc.balance}.",
                alert_type="low_balance",
                is_read=False
            )
            db.add(alert)
        db.commit()
    finally:
        db.close()

def check_budget_exceeded():
    db: Session = SessionLocal()
    try:
        from app.services.alert_service import AlertService
        alert_service = AlertService(db)
        
        users = db.query(User).all()
        for user in users:
            alert_service.check_all_budgets(user.id)
            
    except Exception as e:
        logger.error(f"Error checking budgets: {e}")
    finally:
        db.close()

def start_scheduler():
    scheduler = BackgroundScheduler()

    # Schedule basic automation logic: Checks logic occasionally. 
    # For demo purposes intervals are short, typically these would be hours/days
    scheduler.add_job(check_upcoming_bills, "interval", minutes=2)
    scheduler.add_job(check_low_balance, "interval", minutes=3)
    scheduler.add_job(check_budget_exceeded, "interval", minutes=4)

    scheduler.start()
    logger.info("Background jobs for Automation Alerts started successfully")
