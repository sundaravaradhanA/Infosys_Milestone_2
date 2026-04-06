@echo off
setlocal
title Project Downloader

echo ==========================================
echo    PROJECT DOWNLOADER
echo ==========================================

:: Change to project root directory
cd /d "%~dp0"

echo [1/2] Fetching changes from GitHub...
git fetch --all
if %errorlevel% neq 0 (
    echo [!] Error fetching latest changes. Check your connection.
    pause
    exit /b
)

echo [2/2] Pulling changes...
git pull
if %errorlevel% neq 0 (
    echo [!] Error pulling changes. Please check if you have local conflicts.
    pause
    exit /b
)

echo ==========================================
echo DOWNLOAD & SYNC COMPLETED
echo ==========================================
pause
