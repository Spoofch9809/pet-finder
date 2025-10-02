from sqlalchemy.orm import Session
from ..models import bread_model as models
from ..schema import breed_schema as schema

def get_all_breeds(db: Session):
    return db.query(models.Breed).all()

def get_breed(db: Session, breed_id: int):
    return db.query(models.Breed).filter(models.Breed.breed_id == breed_id).first()

def create_breed(db: Session, breed_in: schema.BreedCreate):
    breed = models.Breed(**breed_in.dict())
    db.add(breed)
    db.commit()
    db.refresh(breed)
    return breed

def update_breed(db: Session, breed_id: int, breed_in: schema.BreedBase):
    breed = get_breed(db, breed_id)
    if not breed:
        return None
    breed.breed = breed_in.breed
    db.commit()
    db.refresh(breed)
    return breed

def delete_breed(db: Session, breed_id: int):
    breed = get_breed(db, breed_id)
    if not breed:
        return None
    db.delete(breed)
    db.commit()
    return breed