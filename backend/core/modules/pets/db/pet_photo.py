from core.infrastructure.db import Base
from sqlalchemy import Column, Integer, ForeignKey, LargeBinary
from sqlalchemy.orm import relationship

class PetPhoto(Base):
    __tablename__ = "pet_photo"

    photo_id = Column(Integer, primary_key=True, autoincrement=False)
    pet_id = Column(Integer, ForeignKey("pet.pet_id"), nullable=False)
    picture = Column(LargeBinary)

    pet = relationship("Pet", back_populates="photos")