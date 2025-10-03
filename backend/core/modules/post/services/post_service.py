from sqlalchemy.orm import Session
from ..models import post_model as models
from ..schema import post_schema as schema

def get_all_posts(db: Session):
    return db.query(models.Post).all()

def get_post(db: Session, post_id: int):
    return db.query(models.Post).filter(models.Post.post_id == post_id).first()

def create_post(db: Session, post_in: schema.PostCreate):
    post = models.Post(**post_in.dict())
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