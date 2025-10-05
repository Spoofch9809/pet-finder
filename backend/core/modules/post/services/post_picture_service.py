from sqlalchemy import func
from sqlalchemy.orm import Session

from ..models import post_picture_model as models
from ..schema import post_picture_schema as schema


def add_post_picture(db: Session, picture_in: schema.PostPictureCreate):
    next_id = (db.query(func.max(models.PostPicture.post_picture_id)).scalar() or 0) + 1
    payload = picture_in.dict()
    picture = models.PostPicture(post_picture_id=next_id, **payload)
    db.add(picture)
    db.commit()
    db.refresh(picture)
    return picture
