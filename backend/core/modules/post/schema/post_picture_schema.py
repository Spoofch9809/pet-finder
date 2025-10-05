from typing import Optional

from pydantic import BaseModel, ConfigDict


class PostPictureBase(BaseModel):
    picture: bytes
    content_type: Optional[str] = None


class PostPictureCreate(PostPictureBase):
    post_id: int


class PostPictureResponse(PostPictureBase):
    post_picture_id: int
    post_id: int

    model_config = ConfigDict(from_attributes=True)
