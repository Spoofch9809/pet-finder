from sqlalchemy.orm import Session
from ..models import pet_model as models
from ..schema import pet_schema as schema

def get_all_pets(db: Session):
    return db.query(models.Pet).all()

def get_pet(db: Session, pet_id: int):
    return db.query(models.Pet).filter(models.Pet.pet_id == pet_id).first()

def create_pet(db: Session, pet_in: schema.PetCreate):
    pet = models.Pet(**pet_in.dict())
    db.add(pet)
    db.commit()
    db.refresh(pet)
    return pet

def update_pet(db: Session, pet_id: int, pet_in: schema.PetUpdate):
    pet = get_pet(db, pet_id)
    if not pet:
        return None
    for field, value in pet_in.dict().items():
        setattr(pet, field, value)
    db.commit()
    db.refresh(pet)
    return pet

def delete_pet(db: Session, pet_id: int):
    pet = get_pet(db, pet_id)
    if not pet:
        return None
    db.delete(pet)
    db.commit()
    return pet