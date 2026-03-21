# USD Input → INR Display TODO

Status: Planning complete. Confirm before proceeding.

## Steps:
- [x] 1. Create `backend/app/services/currency_service.py` - rate fetching & conversion logic
- [x] 2. Update models: add `currency = Column(String, default='USD')` to Transaction, Budget, Bill
- [x] 3. Create DB migration: `add_currency_columns.py` - ALTER TABLE ADD COLUMN
- [ ] 4. Update schemas: TransactionCreate/BudgetCreate etc. `amount_usd: float`, Response +`amount_inr: float`, `usd_to_inr_rate: float`
- [ ] 5. Update routes (transactions.py, budgets.py, bills.py, insights.py): compute INR in GET responses using CurrencyService
- [ ] 6. Update services (alert_service.py, budget_service.py): INR in messages/alerts
- [ ] 7. Frontend: read App.jsx, pages/*.jsx - add rate fetch, $ labels on inputs, ₹ format on displays/charts
- [ ] 8. Update seed scripts: change sample amounts to USD (salary 900 → 83000 INR compute but store 900)
- [ ] 9. Run migration: cd backend && python add_currency_columns.py
- [ ] 10. Reseed data, restart servers (`PROJECT_TEST.bat`), test in Chrome: create $100 txn → see ₹8300
- [ ] 11. Update TODO progress, attempt_completion

Next step after approval: 1. currency_service.py

