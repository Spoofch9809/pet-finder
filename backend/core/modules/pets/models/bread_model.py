from core.infrastructure.db import Base
from sqlalchemy import Column, Integer, String

class Breed(Base):
    __tablename__ = "breed"

    breed_id = Column(Integer, primary_key=True, autoincrement=False)
    breed = Column(String(45), nullable=False)