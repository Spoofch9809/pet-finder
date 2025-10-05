from core.infrastructure.db import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

class Breed(Base):
    __tablename__ = "breed"

    breed_id = Column(Integer, primary_key=True, index=True)
    breed = Column(String(45), nullable=False, unique=True)

    pets = relationship("Pet", back_populates="breed")

