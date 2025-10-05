from datetime import datetime, timezone
from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload
from ..models import post_model as models
from ..schema import post_schema as schema

def get_all_posts(db: Session):
    return (
        db.query(models.Post)
        .options(
            selectinload(models.Post.pictures),
            selectinload(models.Post.pet),
        )
        .all()
    )

def get_post(db: Session, post_id: int):
    return db.query(models.Post).filter(models.Post.post_id == post_id).first()

def create_post(db: Session, post_in: schema.PostCreate):
    next_id = (db.query(func.max(models.Post.post_id)).scalar() or 0) + 1
    payload = post_in.dict()
    timestamp = datetime.now(timezone.utc).replace(tzinfo=None)
    post = models.Post(post_id=next_id, time_stamp=timestamp, **payload)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post

def delete_post(db: Session, post_id: int):
    post = get_post(db, post_id)
    if post:
        db.delete(post)
        db.commit()
    return post