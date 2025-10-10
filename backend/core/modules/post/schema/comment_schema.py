from datetime import datetime
from typing import Optional

from pydantic import BaseModel
from pydantic import ConfigDict


class CommentCreatePayload(BaseModel):
    comment: str
    user_id: int


class CommentCreate(BaseModel):
    post_id: int
    user_id: int
    comment: str


class CommentResponse(BaseModel):
    comment_id: int
    post_id: int
    user_id: int
    comment: str
    time_stamp: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
