from datetime import datetime, date

def determine_bill_status(bill):
    if bill.is_paid:
        return "paid"

    today = date.today()

    if today > bill.due_date.date():
        return "overdue"

    return "upcoming"

