@echo off
setlocal
title Project Uploader - GitHub Sync

echo ==========================================
echo UPDATE FROM GITHUB REPO
echo https://github.com/sundaravaradhanA/Infosys_Milestone_2
echo ==========================================

cd /d "%~dp0"

echo Fetching updates...
git add .
git commit -m "Auto update from local"
git push origin main

if %errorlevel% neq 0 (
    echo [!] Update failed. Check conflicts or connection.
) else (
echo [+] Uploaded to GitHub successfully!
)

echo.
pause

