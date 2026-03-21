from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from io import StringIO
import csv
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from app.database import get_db
from app.models import Transaction, Account, Budget
from typing import Optional

router = APIRouter(tags=["Export"])

@router.get("/transactions")
def export_transactions(
    format: str = Query("csv"),
    user_id: int = Query(1),
    month: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    # Get user's accounts
    accounts = db.query(Account).filter(Account.user_id == user_id).all()
    account_ids = [a.id for a in accounts]
    
    if not account_ids:
        raise HTTPException(status_code=404, detail="No accounts found")
    
    # Query transactions
    query = db.query(Transaction).filter(Transaction.account_id.in_(account_ids))
    if month:
        query = query.filter(func.to_char(Transaction.created_at, 'YYYY-MM') == month)
    
    transactions = query.order_by(Transaction.created_at.desc()).all()
    
    if format == "csv":
        # CSV export
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "Description", "Category", "Amount", "Date"])
        for txn in transactions:
            writer.writerow([
                txn.id,
                txn.description,
                txn.category or "Uncategorized",
                f"{txn.amount:.2f}",
                txn.created_at.strftime("%Y-%m-%d %H:%M")
            ])
        output.seek(0)
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=transactions_{user_id}_{month or 'all'}.csv"}
        )
    else:
        raise HTTPException(status_code=400, detail="Format must be 'csv'")

@router.get("/insights")
def export_insights(
    format: str = Query("pdf"),
    user_id: int = Query(1),
    month: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    if format == "pdf":
        # Simple PDF generation
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        story = []
        styles = getSampleStyleSheet()
        
        # Title
        title = Paragraph("Financial Insights Report", styles['Title'])
        story.append(title)
        story.append(Spacer(1, 12))
        
        # Total balance
        accounts_sum = db.query(func.sum(Account.balance)).filter(Account.user_id == user_id).scalar() or 0
        balance_p = Paragraph(f"Total Balance: ${accounts_sum:.2f}", styles['Normal'])
        story.append(balance_p)
        
        # Budget summary
        budgets = db.query(Budget.category, Budget.limit_amount, Budget.spent_amount).filter(Budget.user_id == user_id).limit(20).all()
        data = [["Category", "Limit", "Spent"]]
        for b in budgets:
            data.append([str(b.category), f"${float(b.limit_amount):.2f}", f"${float(b.spent_amount):.2f}"])
        
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.grey),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 14),
            ('BOTTOMPADDING', (0,0), (-1,0), 12),
            ('BACKGROUND', (0,1), (-1,-1), colors.beige),
            ('GRID', (0,0), (-1,-1), 1, colors.black)
        ]))
        story.append(table)
        
        doc.build(story)
        buffer.seek(0)
        
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=insights_{user_id}_{month or 'all'}.pdf"}
        )
    else:
        raise HTTPException(status_code=400, detail="Format must be 'pdf'")

