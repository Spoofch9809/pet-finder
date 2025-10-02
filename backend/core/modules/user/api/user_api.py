from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..services import user_services as services
from ..schema import user_schema as schema
from infrastructure.db import get_db

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=list[schema.UserResponse])
def list_users(db: Session = Depends(get_db)):
    return services.get_all_users(db)

@router.get("/{user_id}", response_model=schema.UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = services.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=schema.UserResponse)
def create_user(user_in: schema.UserCreate, db: Session = Depends(get_db)):
    return services.create_user(db, user_in)

@router.put("/{user_id}", response_model=schema.UserResponse)
def update_user(user_id: int, user_in: schema.UserCreate, db: Session = Depends(get_db)):
    user = services.update_user(db, user_id, user_in)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.delete("/{user_id}", response_model=schema.UserResponse)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = services.delete_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
