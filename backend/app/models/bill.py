from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Bill(Base):
    __tablename__ = "bills"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    bill_name = Column(String)
    amount = Column(Float)
    due_date = Column(DateTime)
    is_paid = Column(Boolean, default=False)
    category = Column(String)
    currency = Column(String(3), default='USD', index=True)
    
    # Relationships
    user = relationship("User", back_populates="bills")
