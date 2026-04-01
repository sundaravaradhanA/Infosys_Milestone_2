from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, DateTime, Numeric, CheckConstraint
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Bill(Base):
    __tablename__ = "bills"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    biller_name = Column(String, nullable=False)
    due_date = Column(Date, index=True, nullable=False)
    amount_due = Column(Numeric(10, 2), nullable=False)
    status = Column(String, index=True, default="upcoming") # upcoming, paid, overdue
    auto_pay = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        CheckConstraint('amount_due > 0', name='check_amount_due_positive'),
    )

    # Relationships
    user = relationship("User", back_populates="bills")
