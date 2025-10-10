from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..services import user_services as services
from ..schema import user_schema as schema
from ....infrastructure.db import get_session

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=list[schema.UserResponse])
def list_users(db: Session = Depends(get_session)):  # FIXED: get_db -> get_session
    return services.get_all_users(db)

@router.get("/{user_id}", response_model=schema.UserResponse)
def get_user(user_id: int, db: Session = Depends(get_session)):
    user = services.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=schema.UserResponse)
def create_user(user_in: schema.UserCreate, db: Session = Depends(get_session)):
    return services.create_user(db, user_in)

@router.put("/{user_id}", response_model=schema.UserResponse)
def update_user(user_id: int, user_in: schema.UserUpdate, db: Session = Depends(get_session)):
    user = services.update_user(db, user_id, user_in)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.delete("/{user_id}", response_model=schema.UserResponse)
def delete_user(user_id: int, db: Session = Depends(get_session)):
    user = services.delete_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/signup", response_model=schema.TokenResponse, status_code=201)
def signup_user(user_in: schema.UserCreate, db: Session = Depends(get_session)):
    try:
        user, token = services.register_user(db, user_in)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=schema.TokenResponse)
def login_user(credentials: schema.UserLogin, db: Session = Depends(get_session)):
    user = services.authenticate_user(db, credentials.identifier, credentials.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = services.generate_user_token(user)
    return {"access_token": token, "token_type": "bearer", "user": user}
