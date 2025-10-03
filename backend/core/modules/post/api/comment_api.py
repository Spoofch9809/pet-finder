from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..services import comment_picture_service, comment_service
from ..schema import comment_picture_schema, comment_schema
from infrastructure.db import get_db

router = APIRouter(prefix="/comment", tags=["posts"])
@router.post("/{post_id}/comments", response_model=comment_schema.CommentResponse)
def add_comment(post_id: int, 
                comment_in: comment_schema.CommentBase, 
                db: Session = Depends(get_db)):
    
    return comment_service.add_comment(db, 
                                       comment_schema.CommentCreate(post_id=post_id, 
                                                                    **comment_in.dict()))

@router.get("/{post_id}/comments", response_model=list[comment_schema.CommentResponse])
def get_comments(post_id: int, 
                 db: Session = Depends(get_db)):
    
    return comment_service.get_comments_for_post(db, post_id)

@router.post("/comments/{comment_id}/pictures", response_model=comment_picture_schema.CommentPictureResponse)
def add_comment_picture(comment_id: int, 
                        picture_in: comment_picture_schema.CommentPictureBase, 
                        db: Session = Depends(get_db)):
    
    return comment_picture_service.add_comment_picture(db, 
                                                       comment_picture_schema.CommentPictureCreate(comment_id=comment_id, 
                                                                                                   **picture_in.dict()))