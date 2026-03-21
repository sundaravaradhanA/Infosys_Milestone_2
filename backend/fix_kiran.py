"""
Fix user_id=22 (Kiran Kumar) who is missing an account.
"""
import psycopg2
from datetime import datetime

DB_URL = "postgresql://postgres:sundar%402005@localhost:5432/banking_db"
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

# Check if user 22 has an account
cur.execute("SELECT COUNT(*) FROM accounts WHERE user_id=22")
count = cur.fetchone()[0]
print(f"Kiran Kumar (user_id=22) accounts: {count}")

if count == 0:
    # Create a bank account for Kiran Kumar
    cur.execute("""
        INSERT INTO accounts (user_id, bank_name, account_type, balance, currency)
        VALUES (22, 'Union Bank', 'Savings', 40000.00, 'USD')
        RETURNING id
    """)
    acc_id = cur.fetchone()[0]
    print(f"  Created account id={acc_id} for Kiran Kumar")

    # Add a few sample transactions
    transactions = [
        ("Salary Credit", 3000.00, "Salary"),
        ("Amazon Shopping", -120.00, "Shopping"),
        ("Swiggy Food", -45.00, "Food & Dining"),
        ("Electricity Bill", -85.00, "Utilities"),
        ("Metro Card Recharge", -30.00, "Transport"),
    ]
    for desc, amount, category in transactions:
        cur.execute("""
            INSERT INTO transactions (account_id, description, amount, category, currency)
            VALUES (%s, %s, %s, %s, 'USD')
        """, (acc_id, desc, amount, category))
    print(f"  Added {len(transactions)} transactions")

conn.commit()
conn.close()
print("Done.")
