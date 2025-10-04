from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..services import pet_service as services
from ..schema import pet_schema as schema
from infrastructure.db import get_db

router = APIRouter(prefix="/pets", tags=["pets"])

@router.get("/", response_model=list[schema.PetResponse])
def list_pets(db: Session = Depends(get_db)):
    return services.get_all_pets(db)

@router.get("/{pet_id}", response_model=schema.PetResponse)
def get_pet(pet_id: int, db: Session = Depends(get_db)):
    pet = services.get_pet(db, pet_id)
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet

@router.post("/", response_model=schema.PetResponse)
def create_pet(pet_in: schema.PetCreate, db: Session = Depends(get_db)):
    return services.create_pet(db, pet_in)

@router.put("/{pet_id}", response_model=schema.PetResponse)
def update_pet(pet_id: int, pet_in: schema.PetUpdate, db: Session = Depends(get_db)):
    pet = services.update_pet(db, pet_id, pet_in)
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet

@router.delete("/{pet_id}", response_model=schema.PetResponse)
def delete_pet(pet_id: int, db: Session = Depends(get_db)):
    pet = services.delete_pet(db, pet_id)
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet