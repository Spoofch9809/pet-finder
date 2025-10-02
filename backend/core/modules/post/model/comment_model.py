from core.infrastructure.db import Base
from sqlalchemy import Column, Integer, String, LargeBinary, ForeignKey
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.orm import relationship

class Comment(Base):
    __tablename__ = "comment"

    comment_id = Column(Integer, autoincrement=False, primary_key=True)
    post_id = Column(Integer, ForeignKey("post.post_id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("user.user_id"), primary_key=True)
    comment = Column(LONGTEXT, nullable=False)
    comment_picture = Column(LargeBinary)
    time_stamp = Column(String(45), nullable=False)

    post = relationship("Post", back_populates="comments")
    user = relationship("User", back_populates="comments")