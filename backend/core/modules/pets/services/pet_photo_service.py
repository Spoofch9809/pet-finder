from sqlalchemy.orm import Session
from ..models import pet_photo_model as models
from ..schema import pet_photo_schema as schema

def get_all_photos(db: Session):
    return db.query(models.PetPhoto).all()

def get_photo(db: Session, photo_id: int):
    return db.query(models.PetPhoto).filter(models.PetPhoto.photo_id == photo_id).first()

def create_photo(db: Session, photo_in: schema.PetPhotoCreate):
    photo = models.PetPhoto(**photo_in.dict())
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo

def delete_photo(db: Session, photo_id: int):
    photo = get_photo(db, photo_id)
    if not photo:
        return None
    db.delete(photo)
    db.commit()
    return photo
