from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_current_user_id
from app.database import get_db
from app.models.bill import Bill
from app.schemas.bill import BillCreate, BillUpdate, BillResponse
from app.services.bill_status import determine_bill_status
from datetime import datetime

router = APIRouter(tags=["Bills"])

@router.post("/", response_model=BillResponse)
def create_bill(bill: BillCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    if not bill.biller_name.strip():
        raise HTTPException(status_code=400, detail="Biller name cannot be empty")
    if bill.amount_due <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
        
    new_bill = Bill(
        user_id=user_id,
        biller_name=bill.biller_name,
        amount_due=bill.amount_due,
        due_date=bill.due_date,
        auto_pay=bill.auto_pay,
        status="upcoming"
    )
    
    # Check if due date is already passed
    if bill.due_date < datetime.now().date():
        new_bill.status = "overdue"

    db.add(new_bill)
    db.commit()
    db.refresh(new_bill)

    return new_bill

@router.get("/", response_model=list[BillResponse])
def get_bills(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    bills = db.query(Bill).filter(Bill.user_id == user_id).all()
    
    for bill in bills:
        # Dynamic status checking
        current_status = determine_bill_status(bill)
        if bill.status != current_status:
            bill.status = current_status
            db.commit()
            db.refresh(bill)
            
    return bills

@router.put("/{bill_id}", response_model=BillResponse)
def update_bill(bill_id: int, bill_data: BillUpdate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    bill = db.query(Bill).filter(Bill.id == bill_id, Bill.user_id == user_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    if bill_data.biller_name is not None:
        if not bill_data.biller_name.strip():
            raise HTTPException(status_code=400, detail="Biller name cannot be empty")
        bill.biller_name = bill_data.biller_name
        
    if bill_data.amount_due is not None:
        if bill_data.amount_due <= 0:
            raise HTTPException(status_code=400, detail="Amount must be positive")
        bill.amount_due = bill_data.amount_due
        
    if bill_data.due_date is not None:
        bill.due_date = bill_data.due_date
        
    if bill_data.auto_pay is not None:
        bill.auto_pay = bill_data.auto_pay
        
    if bill_data.status is not None:
        bill.status = bill_data.status
    else:
        bill.status = determine_bill_status(bill)

    db.commit()
    db.refresh(bill)
    return bill

@router.delete("/{bill_id}")
def delete_bill(bill_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    bill = db.query(Bill).filter(Bill.id == bill_id, Bill.user_id == user_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    db.delete(bill)
    db.commit()
    return {"message": "Bill deleted successfully"}

@router.patch("/{bill_id}/pay")
def pay_bill(bill_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    bill = db.query(Bill).filter(Bill.id == bill_id, Bill.user_id == user_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    bill.status = "paid"
    db.commit()
    db.refresh(bill)
    return {"message": "Bill marked as paid"}
