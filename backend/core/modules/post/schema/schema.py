from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

#Post
class PostBase(BaseModel):
    description: Optional[str] = None
    location: Optional[str] = None
    lost_time: Optional[datetime] = None
    status: bool


class PostCreate(PostBase):
    user_id: int
    pet_id: int


class PostResponse(PostBase):
    post_id: int
    user_id: int
    pet_id: int
    time_stamp: datetime

    class Config:
        from_attributes = True

#Comment
class CommentBase(BaseModel):
    comment: str
    comment_picture: Optional[bytes] = None
    time_stamp: str   # stored as VARCHAR(45) in DB


class CommentCreate(CommentBase):
    post_id: int
    user_id: int


class CommentResponse(CommentBase):
    comment_id: int
    post_id: int
    user_id: int

    class Config:
        from_attributes = True