import os
import re

def update_models():
    # Transaction model
    trans_file = r"d:\Infosys_Milestone_2\backend\app\models\transaction.py"
    with open(trans_file, 'r', encoding='utf-8') as f:
        t_content = f.read()
    
    if "ix_txn_aggregation" not in t_content:
        if "from sqlalchemy import" in t_content and "Index" not in t_content:
            t_content = t_content.replace(
                "from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime",
                "from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime, Index"
            )
        
        table_args = """    __tablename__ = "transactions"
    __table_args__ = (
        Index('ix_txn_aggregation', 'account_id', 'category', 'created_at'),
    )"""
        t_content = t_content.replace('    __tablename__ = "transactions"', table_args)
        
        with open(trans_file, 'w', encoding='utf-8') as f:
            f.write(t_content)

    # Budget model
    budget_file = r"d:\Infosys_Milestone_2\backend\app\models\budget.py"
    with open(budget_file, 'r', encoding='utf-8') as f:
        b_content = f.read()

    if "ix_budget_lookup" not in b_content:
        if "from sqlalchemy import" in b_content and "Index" not in b_content:
            b_content = b_content.replace(
                "from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, UniqueConstraint",
                "from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, UniqueConstraint, Index"
            )
        
        old_args = """    __table_args__ = (
        UniqueConstraint('user_id', 'category', 'month', name='uq_budget_user_category_month'),
    )"""
        new_args = """    __table_args__ = (
        UniqueConstraint('user_id', 'category', 'month', name='uq_budget_user_category_month'),
        Index('ix_budget_lookup', 'user_id', 'month', 'category'),
    )"""
        b_content = b_content.replace(old_args, new_args)
        
        with open(budget_file, 'w', encoding='utf-8') as f:
            f.write(b_content)

update_models()
print("Models updated with composite indexes.")
