from pydantic import BaseModel

class CommentPictureBase(BaseModel):
    picture: bytes


class CommentPictureCreate(CommentPictureBase):
    comment_id: int


class CommentPictureResponse(CommentPictureBase):
    comment_picture_id: int
    comment_id: int

    class Config:
        orm_mode = True