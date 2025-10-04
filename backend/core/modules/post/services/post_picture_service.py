from sqlalchemy.orm import Session
from ..models import post_picture_model as models
from ..schema import post_picture_schema as schema

def add_post_picture(db: Session, picture_in: schema.PostPictureCreate):
    picture = models.PostPicture(**picture_in.dict())
    db.add(picture)
    db.commit()
    db.refresh(picture)
    return picture