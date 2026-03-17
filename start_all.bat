h@echo off
echo ================================================
echo   Milestone 2 - Digital Banking Application
echo ================================================
echo.

echo [1] Starting Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0/backend && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"


timeout /t 5 /nobreak >nul

echo [2] Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d %~dp0/banking-frontend/banking-frontend && npm run dev"


timeout /t 3 /nobreak >nul

echo [3] Seeding Sample Data...
start "Seeding Data" cmd /k "cd /d %~dp0/backend && python seed_bills_rewards.py"


echo.
echo ================================================
echo   Servers Starting...
echo ================================================
echo.
echo Backend:   http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause >nul
