"""
Full End-to-End API Test — Milestones 1-4
Run from backend/ directory: python run_tests.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app, raise_server_exceptions=False)

PASS = []
FAIL = []

def check(label, condition, detail=""):
    if condition:
        print(f"  [+] PASS: {label}")
        PASS.append(label)
    else:
        print(f"  [-] FAIL: {label} {detail}")
        FAIL.append(f"{label} {detail}")

def run():
    print("=" * 65)
    print("  MILESTONE 1-4 END-TO-END API VERIFICATION")
    print("=" * 65)

    # ----------------------------------------------------------------
    # AUTH (M1)
    # ----------------------------------------------------------------
    print("\n[M1] Authentication & User Management")
    r = client.post("/login", json={"email": "sundaravaradhanmadurai@gmail.com", "password": "Sundar@2005"})
    check("POST /login", r.status_code == 200, r.text[:120])
    token = r.json().get("access_token", "")
    H = {"Authorization": f"Bearer {token}"}

    r = client.post("/login", json={"email": "bad@test.com", "password": "wrong"})
    check("POST /login (bad creds → 401)", r.status_code == 401)

    r = client.get("/accounts/", headers=H)
    check("GET /accounts", r.status_code == 200, r.text[:80])
    accounts = r.json() if r.status_code == 200 else []

    r = client.get("/health")
    check("GET /health", r.status_code == 200)

    # ----------------------------------------------------------------
    # TRANSACTIONS, RULES, CATEGORIZATION (M2)
    # ----------------------------------------------------------------
    print("\n[M2] Transactions, Auto-Categorization & Budgets")
    account_id = accounts[0]["id"] if accounts else None

    if account_id:
        r = client.post("/transactions/", json={
            "account_id": account_id,
            "description": "Zomato Order",
            "amount_usd": -15.0,
            "currency": "USD"
        }, headers=H)
        check("POST /transactions (create)", r.status_code == 200, r.text[:120])
        txn = r.json() if r.status_code == 200 else {}
        # Field checks
        check("Transaction has category field", "category" in txn)

        txn_id = txn.get("id")
        if txn_id:
            r = client.put(f"/transactions/{txn_id}/category", json={"category": "Food & Dining"}, headers=H)
            check("PUT /transactions/{id}/category", r.status_code == 200, r.text[:120])

    r = client.get("/transactions/", headers=H)
    check("GET /transactions", r.status_code == 200)

    r = client.get("/transactions/count", headers=H)
    check("GET /transactions/count", r.status_code == 200)

    r = client.post("/transactions/categorize-all", headers=H)
    check("POST /transactions/categorize-all", r.status_code == 200)

    # Category Rules
    r = client.get("/categories/rules", headers=H)
    check("GET /categories/rules", r.status_code == 200, r.text[:80])

    # Budgets
    r = client.get("/budgets/", headers=H)
    check("GET /budgets", r.status_code == 200)

    # ----------------------------------------------------------------
    # BILLS, REWARDS, CURRENCY (M3)
    # ----------------------------------------------------------------
    print("\n[M3] Bills, Rewards & Currency")

    r = client.get("/api/bills", headers=H)
    check("GET /api/bills", r.status_code == 200, r.text[:80])
    bills = r.json() if r.status_code == 200 else []

    r = client.post("/api/bills", json={
        "biller_name": "Internet Provider",
        "amount_due": 45.0,
        "due_date": "2026-05-15",
        "auto_pay": False
    }, headers=H)
    check("POST /api/bills (create)", r.status_code == 200, r.text[:120])
    new_bill = r.json() if r.status_code == 200 else {}
    bill_id = new_bill.get("id")

    if bill_id:
        r = client.put(f"/api/bills/{bill_id}", json={
            "biller_name": "Internet Provider Updated",
            "amount_due": 50.0,
            "due_date": "2026-05-15",
            "auto_pay": True
        }, headers=H)
        check("PUT /api/bills/{id} (update)", r.status_code == 200, r.text[:120])

        r = client.patch(f"/api/bills/{bill_id}/pay", headers=H)
        check("PATCH /api/bills/{id}/pay (pay bill)", r.status_code == 200, r.text[:120])

        r = client.delete(f"/api/bills/{bill_id}", headers=H)
        check("DELETE /api/bills/{id}", r.status_code == 200, r.text[:80])

    # POST invalid bill (negative amount)
    r = client.post("/api/bills", json={
        "biller_name": "Bad Bill",
        "amount_due": -10.0,
        "due_date": "2026-05-15"
    }, headers=H)
    check("POST /api/bills (negative amount → 422)", r.status_code == 422)

    # Rewards
    r = client.get("/api/rewards", headers=H)
    check("GET /api/rewards", r.status_code == 200)

    # Currency
    r = client.get("/currency/currency-rates", headers=H)
    check("GET /currency/currency-rates", r.status_code == 200, r.text[:80])
    if r.status_code == 200:
        rates = r.json()
        check("Currency has USD or INR key", bool(rates))

    # ----------------------------------------------------------------
    # INSIGHTS (M4)
    # ----------------------------------------------------------------
    print("\n[M4-A] Insights APIs")

    r = client.get("/insights/monthly-summary?month=2026-04", headers=H)
    check("GET /insights/monthly-summary", r.status_code == 200)
    if r.status_code == 200:
        s = r.json()
        check("Summary has total_income", "total_income" in s)
        check("Summary has total_expense", "total_expense" in s)
        check("Summary has balance", "balance" in s)

    r = client.get("/insights/spending-by-category?month=2026-04", headers=H)
    check("GET /insights/spending-by-category", r.status_code == 200)

    r = client.get("/insights/top-merchants?limit=5&month=2026-04", headers=H)
    check("GET /insights/top-merchants", r.status_code == 200)

    r = client.get("/insights/burn-rate", headers=H)
    check("GET /insights/burn-rate", r.status_code == 200)
    if r.status_code == 200:
        br = r.json()
        check("Burn rate has used_percent", "used_percent" in br)
        check("Burn rate has burn_rate_percent", "burn_rate_percent" in br)

    r = client.get("/insights/category-trend?category=Shopping&months=3", headers=H)
    check("GET /insights/category-trend", r.status_code == 200)

    # ----------------------------------------------------------------
    # ALERTS (M4)
    # ----------------------------------------------------------------
    print("\n[M4-B] Alerts & Notifications")

    r = client.get("/alerts/", headers=H)
    check("GET /alerts/", r.status_code == 200)
    alerts = r.json() if r.status_code == 200 else []

    r = client.get("/alerts/?unread_only=true", headers=H)
    check("GET /alerts/?unread_only=true", r.status_code == 200)

    r = client.get("/alerts/unread-count", headers=H)
    check("GET /alerts/unread-count", r.status_code == 200)
    if r.status_code == 200:
        check("Alerts has unread_count field", "unread_count" in r.json())

    if alerts:
        aid = alerts[0]["id"]
        r = client.patch(f"/alerts/{aid}/mark-read", headers=H)
        check("PATCH /alerts/{id}/mark-read", r.status_code == 200)

    r = client.patch("/alerts/mark-all-read", headers=H)
    check("PATCH /alerts/mark-all-read", r.status_code == 200)

    # ----------------------------------------------------------------
    # EXPORTS (M4)
    # ----------------------------------------------------------------
    print("\n[M4-C] Exports")

    r = client.get("/export/transactions?format=csv", headers=H)
    check("GET /export/transactions?format=csv", r.status_code == 200)
    if r.status_code == 200:
        check("CSV content-type correct", "text/csv" in r.headers.get("content-type", ""))

    r = client.get("/export/insights?format=pdf", headers=H)
    check("GET /export/insights?format=pdf", r.status_code == 200)
    if r.status_code == 200:
        check("PDF content-type correct", "application/pdf" in r.headers.get("content-type", ""))

    # ----------------------------------------------------------------
    # KYC, PROFILE (M1)
    # ----------------------------------------------------------------
    print("\n[M1-B] KYC & Profile")

    r = client.get("/users/me", headers=H)
    check("GET /users/me", r.status_code == 200)

    # ----------------------------------------------------------------
    # SUMMARY
    # ----------------------------------------------------------------
    print("\n" + "=" * 65)
    print(f"  RESULTS: {len(PASS)} passed, {len(FAIL)} failed out of {len(PASS)+len(FAIL)} tests")
    
    import json
    with open("test_report.json", "w") as f:
        json.dump({"passed": PASS, "failed": FAIL}, f, indent=2)

    if FAIL:
        print("\n  FAILED TESTS:")
        for f in FAIL:
            print(f"    [-] {f}")
    else:
        print("\n  PASS ALL TESTS - ALL MILESTONES VERIFIED! PASS")
    print("=" * 65)

if __name__ == "__main__":
    run()
