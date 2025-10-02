from core.infrastructure.db import Base
from sqlalchemy import Column, Integer, String, TIMESTAMP, DateTime, ForeignKey
from sqlalchemy.dialects.mysql import LONGTEXT, BIT
from sqlalchemy.orm import relationship

class Post(Base):
    __tablename__ = "post"

    post_id = Column(Integer, primary_key=True, autoincrement=False)
    user_id = Column(Integer, ForeignKey("user.user_id"), nullable=False)
    pet_id = Column(Integer, ForeignKey("pet.pet_id"), nullable=False)
    description = Column(LONGTEXT)
    location = Column(LONGTEXT)
    share_location = Column(String(255))  # MySQL POINT needs GIS extension; store as string if ORM-only
    lost_time = Column(DateTime)
    time_stamp = Column(TIMESTAMP, nullable=False)
    status = Column(BIT(1), nullable=False)

    user = relationship("User", back_populates="posts")
    pet = relationship("Pet", back_populates="posts")