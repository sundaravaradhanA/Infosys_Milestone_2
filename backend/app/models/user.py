from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    phone = Column(String)
    address = Column(String, default="")
    kyc_status = Column(String, default="Pending")
    
    # Relationships
    accounts = relationship("Account", back_populates="user")
    budgets = relationship("Budget", back_populates="user")
    bills = relationship("Bill", back_populates="user")
    rewards = relationship("Reward", back_populates="user")
    alerts = relationship("Alert", back_populates="user")
    category_rules = relationship("CategoryRule", back_populates="user")

