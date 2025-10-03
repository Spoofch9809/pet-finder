from sqlalchemy import Column, Integer, ForeignKey, LargeBinary
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.mysql import BIT
from core.infrastructure.db import Base

class PostPicture(Base):
    __tablename__ = "post_picture"

    post_picture_id = Column(Integer, primary_key=True, autoincrement=False)
    post_id = Column(Integer, ForeignKey("post.post_id"), nullable=False)
    picture = Column(LargeBinary, nullable=False)

    post = relationship("Post", back_populates="pictures")