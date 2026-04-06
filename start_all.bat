@echo off
setlocal enabledelayedexpansion
title Digital Banking Controller v2.2 - Final

set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

echo ========================================================
echo DIGITAL BANKING SINGLE-CLICK (PG pw: sundar@2005)
echo ========================================================
echo.

:: PG
echo [1/4] PostgreSQL...
net start postgresql-x64-18 >nul 2>&1
if !errorlevel! neq 0 (
    net start postgresql-x64-17 >nul 2>&1
    if !errorlevel! neq 0 (
        net start postgresql-x64-16 >nul 2>&1
    )
)
timeout /t 3 >nul
echo.

:: Backend
echo [2/4] Backend...
cd /d "%PROJECT_ROOT%Backend"
python -m pip install -r requirements.txt >nul 2>&1
start "BACKEND-8000" cmd /k "title BACKEND & cd /d \"%PROJECT_ROOT%Backend\" & uvicorn app.main:app --reload --port 8000"

echo Waiting backend/DB init...
timeout /t 15 >nul

echo Data status:
python quick_check.py
echo.

:: Frontend
echo [3/4] Frontend...
cd /d "%PROJECT_ROOT%Frontend"
if not exist "node_modules\" call npm install >nul 2>&1
start "FRONTEND-5173" cmd /k "title FRONTEND & cd /d \"%PROJECT_ROOT%Frontend\" & npm run dev"

timeout /t 5 >nul
start "" "http://localhost:5173"

echo ========================================================
echo SUCCESS: All started!
echo Backend: http://localhost:8000/docs
echo Frontend: http://localhost:5173
echo Close BACKEND/FRONTEND windows to stop.
echo ========================================================
pause

