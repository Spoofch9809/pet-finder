from core.infrastructure.db import Base
from sqlalchemy import Column, Integer, String, TIMESTAMP, DateTime, ForeignKey, Text
from sqlalchemy.dialects.mysql import BIT
from sqlalchemy.orm import relationship

class Post(Base):
    __tablename__ = "post"

    post_id = Column(Integer, primary_key=True, autoincrement=False)
    user_id = Column(Integer, ForeignKey("user.user_id"), nullable=False)
    pet_id = Column(Integer, ForeignKey("pet.pet_id"), nullable=False)
    description = Column(Text)
    location = Column(Text)
    share_location = Column(String(255))  # store as text for simplicity
    lost_time = Column(DateTime)
    time_stamp = Column(TIMESTAMP, nullable=False)
    status = Column(BIT(1), nullable=False)

    user = relationship("User", back_populates="posts")
    pet = relationship("Pet", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    pictures = relationship("PostPicture", back_populates="post", cascade="all, delete-orphan")