@echo off
cd /d d:\Infosys_Milestone_2\Infosys_Milestone_2\backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
