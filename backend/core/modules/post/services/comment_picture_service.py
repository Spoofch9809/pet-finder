from sqlalchemy.orm import Session
from ..models import comment_picture_model as models
from ..schema import comment_picture_schema as schema

def add_comment_picture(db: Session, picture_in: schema.CommentPictureCreate):
    picture = models.CommentPicture(**picture_in.dict())
    db.add(picture)
    db.commit()
    db.refresh(picture)
    return picture