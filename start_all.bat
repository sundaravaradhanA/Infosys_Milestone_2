@echo off
echo ================================================
echo   Modern Digital Banking v2.0 - Full Stack
echo ================================================
echo.

echo [0/4] Checking and installing Milestone 4 Dependencies...
cd /d %~dp0backend
pip install reportlab apscheduler >nul 2>&1

echo Checking environment variables (.env)...
if not exist ".env" (
    echo DATABASE_URL=postgresql://postgres:sundar%%402005@localhost:5432/banking_db > .env
    echo JWT_SECRET=your_jwt_secret_key_here >> .env
    echo JWT_ALGORITHM=HS256 >> .env
    echo Created default .env file for production environment.
)
echo.

echo [1/4] Setting up PostgreSQL multi-user data isolation...
python fix_multiuser_isolation.py
if %errorlevel% neq 0 (
    echo WARNING: DB isolation setup had issues. Check output above.
    pause
)
echo.
echo [1b] Fixing data consistency (transactions/analytics/budget sync)...
python fix_data_consistency.py
if %errorlevel% neq 0 (
    echo WARNING: Data consistency fix had issues. Check output above.
    pause
)
echo DB setup complete.
echo.

echo [2/4] Backend API (localhost:8000) ...
start "Backend" cmd /k "cd /d %~dp0/backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 6 >nul

echo [3/4] Frontend App (localhost:5173) ...
start "Frontend" cmd /k "cd /d %~dp0/banking-frontend/banking-frontend && npm run dev -- --host"

echo.
echo ================================================
echo   All systems running!
echo.
echo   Backend Swagger : http://localhost:8000/docs
echo   Frontend App    : http://localhost:5173
echo   Dashboard       : http://localhost:5173/dashboard
echo.
echo   Login: sundaravaradhanmadurai@gmail.com / Sundar@2005
echo ================================================
echo.
echo Press any key to close this window...
pause >nul

