@echo off
echo Starting full project test...

echo 1. Installing backend deps...
cd backend
pip install -r requirements.txt
cd ..

echo 2. Seeding all data...
cd backend
python seed_all.py
python seed_bills_rewards.py
cd ..

echo 3. Starting backend...
start "Backend" cmd /k "cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 5

echo 4. Starting frontend...
start "Frontend" cmd /k "cd banking-frontend/banking-frontend && npm install && npm run dev"

echo 5. Opening browser...
timeout /t 10
start chrome http://localhost:5173

echo Test complete! Check logs and browser.
pause

