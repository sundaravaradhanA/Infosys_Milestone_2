from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_current_user_id
from app.database import get_db
from app.models.reward import Reward
from app.schemas.reward import RewardCreate, RewardUpdate, RewardResponse

router = APIRouter(tags=["Rewards"])

@router.post("/", response_model=RewardResponse)
def create_reward(reward: RewardCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    if not reward.program_name.strip():
        raise HTTPException(status_code=400, detail="Program name cannot be empty")
        
    new_reward = Reward(
        user_id=user_id,
        program_name=reward.program_name,
        points_balance=reward.points_balance
    )
    db.add(new_reward)
    db.commit()
    db.refresh(new_reward)
    return new_reward

@router.get("/", response_model=list[RewardResponse])
def get_rewards(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    rewards = db.query(Reward).filter(Reward.user_id == user_id).all()
    return rewards

@router.put("/{reward_id}", response_model=RewardResponse)
def update_reward(reward_id: int, reward_data: RewardUpdate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    reward = db.query(Reward).filter(Reward.id == reward_id, Reward.user_id == user_id).first()
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
        
    if reward_data.program_name is not None:
        if not reward_data.program_name.strip():
            raise HTTPException(status_code=400, detail="Program name cannot be empty")
        reward.program_name = reward_data.program_name
    
    if reward_data.points_balance is not None:
        reward.points_balance = reward_data.points_balance

    db.commit()
    db.refresh(reward)
    return reward
