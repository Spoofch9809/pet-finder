from core.infrastructure.db import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.dialects.mysql import MEDIUMTEXT
from sqlalchemy.orm import relationship

class Pet(Base):
    __tablename__ = "pet"

    pet_id = Column(Integer, primary_key=True, autoincrement=False)
    owner_id = Column(Integer, ForeignKey("user.user_id"), nullable=False)
    name = Column(String(45), nullable=False)
    bread = Column(String(45), nullable=False)   # typo in DB (should be "breed"?)
    species = Column(String(45), nullable=False)
    color = Column(String(45), nullable=False)
    age = Column(Integer)
    description = Column(MEDIUMTEXT)

    owner = relationship("User", back_populates="pets")
