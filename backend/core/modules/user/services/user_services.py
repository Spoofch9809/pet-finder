from sqlalchemy import or_
from sqlalchemy.orm import Session

from .....infra.settings import settings
from ..models import user_model as models
from ..schema import user_schema as schema
from .security import create_access_token, hash_password, verify_password

def get_all_users(db: Session):
    return db.query(models.User).all()

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.user_id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str | None):
    if not email:
        return None
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user_in: schema.UserCreate):
    user_data = user_in.dict()
    user_data["password"] = hash_password(user_data["password"])
    user = models.User(**user_data)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def update_user(db: Session, user_id: int, user_in: schema.UserUpdate):
    user = get_user(db, user_id)
    if not user:
        return None

    update_data = user_in.dict(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        update_data["password"] = hash_password(update_data["password"])
    elif "password" in update_data:
        update_data.pop("password")

    for field, value in update_data.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user_id: int):
    user = get_user(db, user_id)
    if not user:
        return None
    db.delete(user)
    db.commit()
    return user

def authenticate_user(db: Session, identifier: str, password: str):
    user = (
        db.query(models.User)
        .filter(
            or_(
                models.User.username == identifier,
                models.User.email == identifier,
            )
        )
        .first()
    )
    if not user:
        return None

    if ":" not in user.password:
        if user.password != password:
            return None
        user.password = hash_password(password)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    if not verify_password(password, user.password):
        return None
    return user

def generate_user_token(user: models.User) -> str:
    payload = {"sub": str(user.user_id), "username": user.username}
    return create_access_token(payload, settings.ACCESS_TOKEN_EXPIRE_SECONDS)

def register_user(db: Session, user_in: schema.UserCreate):
    if get_user_by_username(db, user_in.username):
        raise ValueError("Username is already taken")
    if user_in.email and get_user_by_email(db, user_in.email):
        raise ValueError("Email is already registered")
    user = create_user(db, user_in)
    token = generate_user_token(user)
    return user, token
