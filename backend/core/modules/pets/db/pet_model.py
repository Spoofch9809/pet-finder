from core.infrastructure.db import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.dialects.mysql import MEDIUMTEXT
from sqlalchemy.orm import relationship

class Pet(Base):
    __tablename__ = "pet"

    pet_id = Column(Integer, primary_key=True, autoincrement=False)
    owner_id = Column(Integer, ForeignKey("user.user_id"), nullable=False)
    name = Column(String(45), nullable=False)
    breed_id = Column(Integer, ForeignKey("breed.breed_id"), nullable=False)
    species_id = Column(Integer, ForeignKey("species.species_id"), nullable=False)
    color = Column(String(45), nullable=False)
    age = Column(Integer)
    description = Column(MEDIUMTEXT)

    owner = relationship("User", back_populates="pets")
    breed = relationship("Breed", back_populates="breed")
    species = relationship("Species", back_populates="species")
