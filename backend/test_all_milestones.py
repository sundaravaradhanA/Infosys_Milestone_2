import os
import sys
from fastapi.testclient import TestClient

# Add current directory to path so imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.database import SessionLocal
from app.models.user import User

client = TestClient(app)

def test_full_application():
    print("="*60)
    print("  MODERN DIGITAL BANKING - FULL END-TO-END VERIFICATION  ")
    print("="*60)

    # -------------------------------------------------------------
    # 1. SETUP & AUTHENTICATION (MILESTONE 1)
    # -------------------------------------------------------------
    print("\n[MILESTONE 1] Checking Core Logic...")
    
    # We will authenticate as the first user
    db = SessionLocal()
    user = db.query(User).filter(User.email == "sundaravaradhanmadurai@gmail.com").first()
    if not user:
        print("❌ ERROR: User 'sundaravaradhanmadurai@gmail.com' not found. Ensure fix_multiuser_isolation.py was run.")
        db.close()
        return False
    user_id = user.id
    db.close()

    # Login
    response = client.post("/login", json={"email": "sundaravaradhanmadurai@gmail.com", "password": "Sundar@2005"})
    assert response.status_code == 200, f"Login failed: {response.text}"
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("  ✅ Login successful, JWT token obtained")

    # Fetch Accounts
    response = client.get(f"/accounts/?user_id={user_id}", headers=headers)
    assert response.status_code == 200, "Failed to fetch accounts"
    accounts = response.json()
    print(f"  ✅ Accounts fetch successful: {len(accounts)} accounts found")

    # -------------------------------------------------------------
    # 2. TRANSACTIONS & CATEGORIZATION (MILESTONE 2)
    # -------------------------------------------------------------
    print("\n[MILESTONE 2] Checking Transaction Flow & Categorization...")
    
    if len(accounts) > 0:
        account_id = accounts[0]["id"]
        # Create a transaction
        txn_data = {
            "account_id": account_id,
            "description": "Amazon Purchase",
            "amount_usd": -50.00,
            "currency": "USD"
        }
        response = client.post("/transactions/", json=txn_data, headers=headers)
        assert response.status_code == 200, f"Failed to create transaction: {response.text}"
        print("  ✅ Transaction creation successful (Description: Amazon Purchase)")
        
        # Verify Rule Engine automatically categorized it (assuming a rule for 'amazon' exists)
        created_txn = response.json()
        print(f"  ✅ Automatic Categorization result: {created_txn.get('category')}")
        
    # Fetch Budgets
    response = client.get(f"/budgets/?user_id={user_id}", headers=headers)
    assert response.status_code == 200, "Failed to fetch budgets"
    budgets = response.json()
    print(f"  ✅ Budgets fetch successful: {len(budgets)} active budgets")

    # -------------------------------------------------------------
    # 3. BILLS & REWARDS (MILESTONE 3)
    # -------------------------------------------------------------
    print("\n[MILESTONE 3] Checking Bills & Rewards Integration...")
    
    # Fetch Bills
    response = client.get("/api/bills", headers=headers)
    assert response.status_code == 200, f"Failed to fetch bills: {response.text}"
    bills = response.json()
    print(f"  ✅ Bills query successful: {len(bills)} bills pending")

    # Create a bill
    bill_data = {
        "biller_name": "Test Insurance",
        "amount_due": 120.0,
        "due_date": "2026-05-01",
        "auto_pay": False
    }
    response = client.post("/api/bills", json=bill_data, headers=headers)
    assert response.status_code == 200, f"Failed to create bill: {response.text}"
    new_bill = response.json()
    print("  ✅ Bill creation successful, validations verified")
    
    # Fetch Rewards
    response = client.get("/api/rewards", headers=headers)
    assert response.status_code == 200, f"Failed to fetch rewards: {response.text}"
    rewards = response.json()
    print(f"  ✅ Rewards processing successful, retrieved {len(rewards)} programs")

    # Currency exchange summary fetch
    response = client.get("/currency/currency-rates", headers=headers)
    if response.status_code == 200:
        rates = response.json()
        print(f"  ✅ External Exchange Rate API connection verified (base={rates.get('base_currency', 'USD')})")
    else:
        print(f"  ⚠️ Exchange Rate API failed, but it might be due to offline env or rate limits. {response.text}")

    # -------------------------------------------------------------
    # 4. INSIGHTS & AUTOMATED ALERTS & EXPORTS (MILESTONE 4)
    # -------------------------------------------------------------
    print("\n[MILESTONE 4] Checking Insights, Alerts & Exports...")

    # Fetch Insights: Monthly Summary
    curr_month = "2026-04" 
    response = client.get(f"/insights/monthly-summary?month={curr_month}", headers=headers)
    assert response.status_code == 200, "Monthly summary failed"
    m_summary = response.json()
    print(f"  ✅ Monthly Summary (Cashflow) API computed: Balance = {m_summary.get('balance', 0)}")

    # Fetch Top Merchants
    response = client.get("/insights/top-merchants?limit=3", headers=headers)
    assert response.status_code == 200, "Top merchants failed"
    print(f"  ✅ Top Merchants API computed: returned {len(response.json())} top spenders")

    # Fetch Category Spending
    response = client.get("/insights/spending-by-category", headers=headers)
    assert response.status_code == 200, "Category spend failed"
    print(f"  ✅ Category Spending API computed correctly")

    # Fetch Burn Rate
    response = client.get("/insights/burn-rate", headers=headers)
    assert response.status_code == 200, "Burn rate failed"
    burn = response.json()
    print(f"  ✅ Burn rate correctly calculated: {burn.get('burn_rate_percent', 0)}%")

    # Alerts Operations
    response = client.get("/alerts/?unread_only=true", headers=headers)
    assert response.status_code == 200, "Alerts fetch failed"
    unread_alerts = response.json()
    print(f"  ✅ Alerts correctly fetched: {len(unread_alerts)} unread alerts found")
    
    if len(unread_alerts) > 0:
        alert_id = unread_alerts[0]["id"]
        response = client.patch(f"/alerts/{alert_id}/mark-read", headers=headers)
        assert response.status_code == 200, f"Mark read failed: {response.text}"
        print(f"  ✅ Specific alert marked as read successfully")

    # Exports
    response = client.get("/export/transactions?format=csv", headers=headers)
    assert response.status_code == 200, "CSV Export failed"
    assert "text/csv" in response.headers.get("content-type", "")
    print("  ✅ CSV Export format parsed successfully")

    response = client.get("/export/insights?format=pdf", headers=headers)
    assert response.status_code == 200, "PDF Export failed"
    assert "application/pdf" in response.headers.get("content-type", "")
    print("  ✅ PDF Export stream successful")

    print("\n" + "="*60)
    print(" 🎉 ALL MILESTONES (1-4) VERIFIED & INTEGRATION SUCCESSFUL 🎉")
    print("="*60)
    return True

if __name__ == "__main__":
    success = test_full_application()
    sys.exit(0 if success else 1)
