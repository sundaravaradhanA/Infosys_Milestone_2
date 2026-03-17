from datetime import datetime

def determine_bill_status(bill):

    if bill.status == "paid":
        return "paid"

    today = datetime.utcnow().date()

    if today > bill.due_date:
        return "overdue"

    return "upcoming"
