from sqlalchemy.orm import Session
from ..models import pet_photo_model as models

def get_all_pet_photos(db: Session):
    return db.query(models.PetPhoto).all()


def get_pet_photo(db: Session, photo_id: int):
    return db.query(models.PetPhoto).filter(models.PetPhoto.photo_id == photo_id).first()


def create_pet_photo(db: Session, pet_id: int, picture_bytes: bytes):
    pet_photo = models.PetPhoto(pet_id=pet_id, picture=picture_bytes)
    db.add(pet_photo)
    db.commit()
    db.refresh(pet_photo)
    return pet_photo


def delete_pet_photo(db: Session, photo_id: int):
    photo = get_pet_photo(db, photo_id)
    if not photo:
        return None
    db.delete(photo)
    db.commit()
    return photo
