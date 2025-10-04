from pydantic import BaseModel
from typing import Optional
from datetime import datetime

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
        orm_mode = True