from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from ..services import pet_photo_service as services
from ..schema import pet_photo_schema as schema
from infrastructure.db import get_db

router = APIRouter(prefix="/pet-photos", tags=["pet-photos"])

@router.get("/", response_model=list[schema.PetPhotoResponse])
def list_photos(db: Session = Depends(get_db)):
    return services.get_all_photos(db)

@router.get("/{photo_id}", response_model=schema.PetPhotoResponse)
def get_photo(photo_id: int, db: Session = Depends(get_db)):
    photo = services.get_photo(db, photo_id)
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    return photo

@router.post("/", response_model=schema.PetPhotoResponse)
def create_photo(photo_in: schema.PetPhotoCreate, db: Session = Depends(get_db)):
    return services.create_photo(db, photo_in)

@router.delete("/{photo_id}", response_model=schema.PetPhotoResponse)
def delete_photo(photo_id: int, db: Session = Depends(get_db)):
    photo = services.delete_photo(db, photo_id)
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    return photo