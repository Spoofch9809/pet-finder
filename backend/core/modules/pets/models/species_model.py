from core.infrastructure.db import Base
from sqlalchemy import Column, Integer, String

class Species(Base):
    __tablename__ = "species"

    species_id = Column(Integer, primary_key=True, autoincrement=False)
    species = Column(String(45), nullable=False)