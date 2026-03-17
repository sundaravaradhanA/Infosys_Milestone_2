@echo off
echo Starting Backend Server...
start "Backend" cmd /k "cd /d d:\Infosys_Milestone_2\Infosys_Milestone_2\backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Frontend...
start "Frontend" cmd /k "cd /d d:\Infosys_Milestone_2\Infosys_Milestone_2\banking-frontend\banking-frontend && call npm install && npm run dev"

echo.
echo Both servers are starting!
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
pause
