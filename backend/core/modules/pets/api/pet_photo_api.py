from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from .. import services, schema
from infrastructure.db import get_db

pet_photo_router = APIRouter(prefix="/photos", tags=["pet-photos"])


@pet_photo_router.post("/", response_model=schema.PetPhotoResponse)
async def upload_pet_photo(pet_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()  # read bytes from uploaded file
    pet_photo = services.create_pet_photo(db, pet_id, content)
    return pet_photo


@pet_photo_router.get("/", response_model=list[schema.PetPhotoResponse])
def list_pet_photos(db: Session = Depends(get_db)):
    return services.get_all_pet_photos(db)


@pet_photo_router.get("/{photo_id}", response_model=schema.PetPhotoResponse)
def get_pet_photo(photo_id: int, db: Session = Depends(get_db)):
    photo = services.get_pet_photo(db, photo_id)
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    return photo


@pet_photo_router.delete("/{photo_id}", response_model=schema.PetPhotoResponse)
def delete_pet_photo(photo_id: int, db: Session = Depends(get_db)):
    photo = services.delete_pet_photo(db, photo_id)
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    return photo