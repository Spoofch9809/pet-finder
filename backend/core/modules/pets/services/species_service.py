from sqlalchemy.orm import Session
from ..models import species_model as models
from ..schema import species_schema as schema

def get_all_species(db: Session):
    return db.query(models.Species).all()


def get_species(db: Session, species_id: int):
    return db.query(models.Species).filter(models.Species.species_id == species_id).first()


def create_species(db: Session, species_in: schema.SpeciesCreate):
    species = models.Species(**species_in.dict())
    db.add(species)
    db.commit()
    db.refresh(species)
    return species


def update_species(db: Session, species_id: int, species_in: schema.SpeciesCreate):
    species = get_species(db, species_id)
    if not species:
        return None
    species.species = species_in.species
    db.commit()
    db.refresh(species)
    return species


def delete_species(db: Session, species_id: int):
    species = get_species(db, species_id)
    if not species:
        return None
    db.delete(species)
    db.commit()
    return species