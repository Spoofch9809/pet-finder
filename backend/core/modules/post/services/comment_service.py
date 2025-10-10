from datetime import datetime, timezone

from sqlalchemy.orm import Session

from ..models import comment_model as models
from ..schema import comment_schema as schema


def add_comment(db: Session, comment_in: schema.CommentCreate):
    timestamp = datetime.now(timezone.utc).replace(tzinfo=None)
    comment = models.Comment(time_stamp=timestamp, **comment_in.dict())
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


def get_comments_for_post(db: Session, post_id: int):
    return (
        db.query(models.Comment)
        .filter(models.Comment.post_id == post_id)
        .order_by(models.Comment.time_stamp.asc())
        .all()
    )
