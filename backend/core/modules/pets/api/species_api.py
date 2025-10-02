from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..services import species_service as services
from ..schema import species_schema as schema
from infrastructure.db import get_db

router = APIRouter(prefix="/species", tags=["species"])

@router.get("/", response_model=list[schema.SpeciesResponse])
def list_species(db: Session = Depends(get_db)):
    return services.get_all_species(db)

@router.get("/{species_id}", response_model=schema.SpeciesResponse)
def get_species(species_id: int, db: Session = Depends(get_db)):
    species = services.get_species(db, species_id)
    if not species:
        raise HTTPException(status_code=404, detail="Species not found")
    return species

@router.post("/", response_model=schema.SpeciesResponse)
def create_species(species_in: schema.SpeciesCreate, db: Session = Depends(get_db)):
    return services.create_species(db, species_in)

@router.put("/{species_id}", response_model=schema.SpeciesResponse)
def update_species(species_id: int, species_in: schema.SpeciesBase, db: Session = Depends(get_db)):
    species = services.update_species(db, species_id, species_in)
    if not species:
        raise HTTPException(status_code=404, detail="Species not found")
    return species

@router.delete("/{species_id}", response_model=schema.SpeciesResponse)
def delete_species(species_id: int, db: Session = Depends(get_db)):
    species = services.delete_species(db, species_id)
    if not species:
        raise HTTPException(status_code=404, detail="Species not found")
    return species