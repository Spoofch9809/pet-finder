from pydantic import BaseModel

class PostPictureBase(BaseModel):
    picture: bytes


class PostPictureCreate(PostPictureBase):
    post_id: int


class PostPictureResponse(PostPictureBase):
    post_picture_id: int
    post_id: int

    class Config:
        orm_mode = True