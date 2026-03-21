from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.bill import Bill
from app.schemas.bill import BillCreate, BillResponse
from app.services.bill_status import determine_bill_status
from app.services.currency_service import currency_service

router = APIRouter(tags=["Bills"])


# CREATE BILL
@router.post("/", response_model=BillResponse)
def create_bill(bill: BillCreate, db: Session = Depends(get_db)):
    from datetime import datetime

    # Validate bill name
    if not bill.bill_name.strip():
        raise HTTPException(status_code=400, detail="Bill name cannot be empty")

    # Validate amount
    if bill.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    new_bill = Bill(
        user_id=bill.user_id,
        bill_name=bill.bill_name,
        amount=bill.amount,
        due_date=datetime.fromisoformat(bill.due_date),
        is_paid=False,
        category="Bills"
    )



    db.add(new_bill)
    db.commit()
    db.refresh(new_bill)

    return new_bill


# GET BILLS
@router.get("/", response_model=list[BillResponse])
def get_bills(user_id: int = Query(...), db: Session = Depends(get_db)):

    bills = db.query(Bill).filter(Bill.user_id == user_id).all()

    rate = currency_service.get_usd_to_inr_rate()
    response_data = []
    for bill in bills:
        status = determine_bill_status(bill)
        response_data.append({
            'id': bill.id,
            'user_id': bill.user_id,
            'currency': 'USD',
            'amount_usd': float(bill.amount),
            'amount_inr': currency_service.convert_usd_to_inr(float(bill.amount)),
            'usd_to_inr_rate': rate,
            'bill_name': bill.bill_name,
            'due_date': bill.due_date.isoformat(),
            'is_paid': bill.is_paid,
            'category': bill.category,
            'status': status
        })
    return response_data




# UPDATE BILL
@router.put("/{bill_id}", response_model=BillResponse)
def update_bill(
    bill_id: int,
    bill: BillCreate,
    db: Session = Depends(get_db)
):
    from datetime import datetime

    existing_bill = db.query(Bill).filter(Bill.id == bill_id).first()

    if not existing_bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    # Validate bill name
    if not bill.bill_name.strip():
        raise HTTPException(status_code=400, detail="Bill name cannot be empty")

    # Validate amount
    if bill.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    existing_bill.bill_name = bill.bill_name
    existing_bill.amount = bill.amount
    existing_bill.due_date = datetime.fromisoformat(bill.due_date)

    db.commit()
    db.refresh(existing_bill)

    return existing_bill



# MARK BILL AS PAID
@router.patch("/{bill_id}/pay")
def pay_bill(
    bill_id: int,
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):

    bill = db.query(Bill).filter(
        Bill.id == bill_id,
        Bill.user_id == user_id
    ).first()

    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    bill.is_paid = True

    db.commit()

    return {"message": "Bill marked as paid"}


# DELETE BILL
@router.delete("/{bill_id}")
def delete_bill(
    bill_id: int,
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):

    bill = db.query(Bill).filter(
        Bill.id == bill_id,
        Bill.user_id == user_id
    ).first()

    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    db.delete(bill)
    db.commit()

    return {"message": "Bill deleted successfully"}

