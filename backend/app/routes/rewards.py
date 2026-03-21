from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from pydantic import BaseModel
from app.models.user import User

router = APIRouter(prefix="/api/rewards", tags=["Rewards"])

class TotalPoints(BaseModel):
    total_points: int = 0

class RewardsList(BaseModel):
    id: int
    title: str
    description: str
    category: str
    color: str
    bgColor: str
    expires: str
    icon: str

@router.get("/", response_model=List[RewardsList])
def get_rewards(user_id: int = 1, db: Session = Depends(get_db)):
    # Sample rewards data
    rewards = [
        {
            "id": 1,
            "title": "Cashback 5%",
            "description": "Get 5% cashback on groceries this month",
            "category": "Cashback",
            "color": "from-green-400 to-green-600",
            "bgColor": "bg-green-100 text-green-800",
            "expires": "2024-12-31",
            "icon": "💰"
        },
        {
            "id": 2,
            "title": "Free ATM Withdrawals",
            "description": "Unlimited free ATM withdrawals until end of month",
            "category": "Banking",
            "color": "from-blue-400 to-blue-600",
            "bgColor": "bg-blue-100 text-blue-800",
            "expires": "2024-11-30",
            "icon": "🏧"
        }
    ]
    return rewards

@router.get("/total-points", response_model=TotalPoints)
def get_total_points(user_id: int = 1, db: Session = Depends(get_db)):
    # Calculate points based on transactions/spending (mock)
    user = db.query(User).filter(User.id == user_id).first()
    total_points = 1250 if user else 0  # Mock data
    return TotalPoints(total_points=total_points)

