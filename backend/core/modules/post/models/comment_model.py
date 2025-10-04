from core.infrastructure.db import Base
from sqlalchemy import Column, Integer, ForeignKey, TIMESTAMP, Text
from sqlalchemy.orm import relationship

class Comment(Base):
    __tablename__ = "comment"

    comment_id = Column(Integer, primary_key=True, autoincrement=False)
    post_id = Column(Integer, ForeignKey("post.post_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("user.user_id"), nullable=False)
    comment = Column(Text, nullable=False)
    time_stamp = Column(TIMESTAMP, nullable=False)

    post = relationship("Post", back_populates="comments")
    user = relationship("User", back_populates="comments")
    pictures = relationship("CommentPicture", back_populates="comment", cascade="all, delete-orphan")