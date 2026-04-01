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
        today = datetime.now().date()
        reminder_date = today + timedelta(days=2)

        # Check bills due soon
        # Example logic: if bill_due_date - today <= 2 days: send_reminder()
        bills = db.query(Bill).filter(
            Bill.due_date <= reminder_date,
            Bill.due_date >= today,
            Bill.status == "upcoming"
        ).all()

        for bill in bills:
            # Check if alert already exists recently
            existing = db.query(Alert).filter(
                Alert.user_id == bill.user_id,
                Alert.alert_type == "bill_due",
                Alert.title.like(f"%{bill.biller_name}%")
            ).first()
            
            if existing:
                continue

            alert = Alert(
                user_id=bill.user_id,
                title=f"Upcoming Bill: {bill.biller_name}",
                message=f"Reminder: Your {bill.biller_name} bill for ${bill.amount_due} is due on {bill.due_date}.",
                alert_type="bill_due",
                is_read=False
            )
            db.add(alert)
            logger.info(f"Created reminder for bill: {bill.biller_name}")
            
        db.commit()
    finally:
        db.close()

def check_low_balance():
    db: Session = SessionLocal()
    try:
        THRESHOLD = 2000
        accounts = db.query(Account).filter(Account.balance < THRESHOLD).all()
        
        for acc in accounts:
            existing = db.query(Alert).filter(
                Alert.user_id == acc.user_id,
                Alert.alert_type == "low_balance",
                Alert.title.like(f"%{acc.bank_name}%"),
                Alert.created_at >= datetime.utcnow() - timedelta(days=2)
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

    # Schedule run every day at 9 AM (for testing, run every 2 minutes)
    # scheduler.add_job(check_upcoming_bills, 'cron', hour=9, minute=0)
    scheduler.add_job(check_upcoming_bills, "interval", minutes=2)
    scheduler.add_job(check_low_balance, "interval", minutes=3)
    scheduler.add_job(check_budget_exceeded, "interval", minutes=4)

    scheduler.start()
    logger.info("Background jobs for reminders started successfully")
