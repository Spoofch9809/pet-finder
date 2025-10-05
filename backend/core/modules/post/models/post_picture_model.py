from sqlalchemy import Column, Integer, ForeignKey, LargeBinary, String
from sqlalchemy.orm import relationship
from core.infrastructure.db import Base


class PostPicture(Base):
    __tablename__ = "post_picture"

    post_picture_id = Column(Integer, primary_key=True, autoincrement=False)
    post_id = Column(Integer, ForeignKey("post.post_id"), nullable=False)
    picture = Column(LargeBinary, nullable=False)
    content_type = Column(String(100), nullable=True)

    post = relationship("Post", back_populates="pictures")
