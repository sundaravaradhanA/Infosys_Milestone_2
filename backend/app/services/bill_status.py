from datetime import date

def determine_bill_status(bill):
    if bill.status == "paid":
        return "paid"

    today = date.today()

    if today > bill.due_date:
        return "overdue"

    return "upcoming"
