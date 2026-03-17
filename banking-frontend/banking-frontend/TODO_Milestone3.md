# Milestone 3 Frontend Implementation - Bills & Rewards

## Frontend Checklist (Milestone 3)

### Bills Page
- [x] Bills page created (/dashboard/bills) ✅
- [x] Add bill form working (POST /api/bills) ✅
- [x] Bills list displayed (GET /api/bills?user_id=1) ✅
- [ ] Edit bill working (backend missing PUT)
- [x] Delete bill working (DELETE /api/bills/{id}) ✅
- [x] Mark as paid working (PATCH /api/bills/{id}/pay) ✅

### Bill Reminders
- [ ] Upcoming bills visible in DashboardHome
- [ ] Due-date alerts displayed (due < 7 days)
- [ ] Overdue bills highlighted (due < today)

### Bill Status
- [ ] Mark as paid button works
- [ ] Status badge updates correctly (Upcoming/Paid/Overdue)

### Rewards Dashboard
- [ ] Rewards data fetched from /api/rewards?user_id=1
- [ ] Points displayed (program_name, points_balance)
- [ ] Last updated time shown

### Currency Summary
- [ ] Currency rates displayed (/api/exchange-rates)
- [ ] Widget in Dashboard sidebar/home

### UI Quality
- [ ] Responsive layout (mobile/tablet/desktop)
- [ ] Loading spinners implemented
- [ ] Error messages displayed (API failures)
- [ ] Empty states (No bills, No rewards)
- [ ] Success notifications (after actions)

## Implementation Steps (Current Progress)
1. [x] Created this TODO.md ✅
2. [x] Updated Dashboard.jsx nav & route ✅
3. [x] Created Bills.jsx full CRUD UI ✅ (adjust API to backend schema next)
4. [ ] Update Rewards.jsx (API integration)
5. [ ] Add Currency widget to Dashboard
6. [ ] Add bill reminders to DashboardHome
7. [ ] Test & polish UX
8. [ ] Mark complete ✅

**Assumed APIs (backend routes exist):**
- GET/POST/PUT/DELETE/PATCH http://127.0.0.1:8000/api/bills?user_id=1 or /api/bills/{id}
- GET http://127.0.0.1:8000/api/rewards?user_id=1
- GET http://127.0.0.1:8000/api/exchange-rates

**Commands to test:**
- Backend: run_backend_new.bat
- Frontend: cd banking-frontend/banking-frontend && npm run dev
- User ID: 1 (hardcoded for demo)

