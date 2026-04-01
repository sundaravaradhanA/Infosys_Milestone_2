from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from datetime import datetime

class Transaction(Base):
    __tablename__ = "transactions"
    __table_args__ = (
        Index('ix_txn_aggregation', 'account_id', 'category', 'created_at'),
    )
    
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"))
    description = Column(String)
    category = Column(String, nullable=True, index=True)
    amount = Column(Numeric(12, 2))  # NUMERIC for financial precision
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    currency = Column(String(3), default='USD', index=True)
    
    # Relationships
    account = relationship("Account", back_populates="transactions")
