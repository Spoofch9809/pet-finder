from pydantic import BaseModel
from datetime import datetime

class CommentBase(BaseModel):
    comment: str
    time_stamp: datetime


class CommentCreate(CommentBase):
    post_id: int
    user_id: int


class CommentResponse(CommentBase):
    comment_id: int
    post_id: int
    user_id: int

    class Config:
        orm_mode = True