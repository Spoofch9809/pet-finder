from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from .post_picture_schema import PostPictureResponse


class PostBase(BaseModel):
    description: Optional[str] = None
    location: Optional[str] = None
    share_location: Optional[str] = None
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
    pictures: list[PostPictureResponse] = []

    model_config = ConfigDict(from_attributes=True)


PostResponse.model_rebuild()
