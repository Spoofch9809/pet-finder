from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..services import breed_service as services
from ..schema import breed_schema as schema
from infrastructure.db import get_db

breed_router = APIRouter(prefix="/breeds", tags=["breeds"])

@breed_router.get("/", response_model=list[schema.BreedResponse])
def list_breeds(db: Session = Depends(get_db)):
    return services.get_all_breeds(db)

@breed_router.get("/{breed_id}", response_model=schema.BreedResponse)
def get_breed(breed_id: int, db: Session = Depends(get_db)):
    breed = services.get_breed(db, breed_id)
    if not breed:
        raise HTTPException(status_code=404, detail="Breed not found")
    return breed

@breed_router.post("/", response_model=schema.BreedResponse)
def create_breed(breed_in: schema.BreedCreate, db: Session = Depends(get_db)):
    return services.create_breed(db, breed_in)

@breed_router.put("/{breed_id}", response_model=schema.BreedResponse)
def update_breed(breed_id: int, breed_in: schema.BreedBase, db: Session = Depends(get_db)):
    breed = services.update_breed(db, breed_id, breed_in)
    if not breed:
        raise HTTPException(status_code=404, detail="Breed not found")
    return breed

@breed_router.delete("/{breed_id}", response_model=schema.BreedResponse)
def delete_breed(breed_id: int, db: Session = Depends(get_db)):
    breed = services.delete_breed(db, breed_id)
    if not breed:
        raise HTTPException(status_code=404, detail="Breed not found")
    return breed