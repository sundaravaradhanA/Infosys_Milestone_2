@echo off
setlocal
title GitHub Upload - All Files
echo ==========================================
echo UPLOAD ALL FILES TO GITHUB
echo https://github.com/sundaravaradhanA/Infosys_Milestone_2
echo ==========================================

cd /d "%~dp0"

:: Set remote if needed (uncomment if remote wrong)
:: git remote set-url origin https://github.com/sundaravaradhanA/Infosys_Milestone_2.git

git add .
git commit -m "Upload all project files"
git push origin main

pause

