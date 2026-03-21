from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class Budget(Base):
    __tablename__ = "budgets"
    __table_args__ = (
        UniqueConstraint('user_id', 'category', 'month', name='uq_budget_user_category_month'),
    )
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    category = Column(String, index=True)
    limit_amount = Column(Numeric(12, 2))  # NUMERIC for financial precision
    spent_amount = Column(Numeric(12, 2), default=0)
    month = Column(String, index=True)  # e.g., "2024-01"
    currency = Column(String(3), default='USD', index=True)
    
    # Relationships
    user = relationship("User", back_populates="budgets")
