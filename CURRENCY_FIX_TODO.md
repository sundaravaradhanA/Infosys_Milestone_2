# Currency Fix TODO - USD Input → INR Display
Status: Approved by user. Proceed step-by-step.

## Steps from Plan:
- [x] 1. Run DB migration: cd backend && python add_currency_columns.py (✅ columns added, 0 records updated - no data?)
- [x] 2. Verify currency_service rate: Server not running (/currency endpoint unavailable), service USD->INR~83 expected.



- [x] 3. Update schemas/budget.py: Add usd fields to Create, inr/rate to Response.
- [x] 4. Update schemas/bill.py: Add usd to Create, inr/rate to Response.
- [x] 5. Update routes/budgets.py & bills.py: Compute INR in GET responses like transactions.py.
- [ ] 6. Frontend Transactions.jsx: Add USD input form/modal, fetch rate, label "$ USD", confirm table uses amount_inr.
- [ ] 7. Update seed_sample_data.py: Set amounts as USD values (e.g. salary 5000 → store 5000 USD).
- [ ] 8. Reseed: cd backend && python seed_sample_data.py
- [ ] 9. Restart servers: start_all.bat
- [ ] 10. Test: Create $10 txn → DB amount=10 USD, table ₹835, summary correct.
- [ ] 11. Update CURRENCY_TODO.md complete, attempt_completion.

**Next: Update budget/bill schemas & routes (steps 3-5).**
