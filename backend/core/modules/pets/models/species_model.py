from core.infrastructure.db import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

class Species(Base):
    __tablename__ = "species"

    species_id = Column(Integer, primary_key=True, index=True)
    species = Column(String(45), nullable=False, unique=True)

    pets = relationship("Pet", back_populates="species")