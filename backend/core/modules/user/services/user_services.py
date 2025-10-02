from sqlalchemy.orm import Session
from ..models import user_model as models
from ..schema import user_schema as schema

def get_all_users(db: Session):
    return db.query(models.User).all()

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.user_id == user_id).first()

def create_user(db: Session, user_in: schema.UserCreate):
    user = models.User(**user_in.dict())
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def update_user(db: Session, user_id: int, user_in: schema.UserCreate):
    user = get_user(db, user_id)
    if not user:
        return None
    for field, value in user_in.dict().items():
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
