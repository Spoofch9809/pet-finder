from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..services import post_service, post_picture_service
from ..schema import post_schema, post_picture_schema
from infrastructure.db import get_db

router = APIRouter(prefix="/posts", tags=["posts"])
@router.get("/", response_model=list[post_schema.PostResponse])
def list_posts(db: Session = Depends(get_db)):
    return post_service.get_all_posts(db)

@router.get("/{post_id}", response_model=post_schema.PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = post_service.get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.post("/", response_model=post_schema.PostResponse)
def create_post(post_in: post_schema.PostCreate, db: Session = Depends(get_db)):
    return post_service.create_post(db, post_in)

@router.delete("/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db)):
    post = post_service.delete_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post deleted successfully"}

@router.post("/{post_id}/pictures", response_model=post_picture_schema.PostPictureResponse)
def add_post_picture(post_id: int, 
                     picture_in: post_picture_schema.PostPictureBase, 
                     db: Session = Depends(get_db)):
    return post_picture_service.add_post_picture(db, 
                                                 post_picture_schema.PostPictureCreate(post_id=post_id, 
                                                                                       **picture_in.dict()))