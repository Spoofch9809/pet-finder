from core.infrastructure.db import Base
from sqlalchemy import Column, Integer, ForeignKey, LargeBinary
from sqlalchemy.orm import relationship

class CommentPicture(Base):
    __tablename__ = "comment_picture"

    comment_picture_id = Column(Integer, primary_key=True, autoincrement=False)
    comment_id = Column(Integer, ForeignKey("comment.comment_id"), nullable=False)
    picture = Column(LargeBinary, nullable=False)

    comment = relationship("Comment", back_populates="pictures")