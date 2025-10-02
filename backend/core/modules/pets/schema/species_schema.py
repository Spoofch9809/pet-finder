from pydantic import BaseModel

class SpeciesBase(BaseModel):
    species: str

class SpeciesCreate(SpeciesBase):
    pass

class SpeciesResponse(SpeciesBase):
    species_id: int

    class Config:
        orm_mode = True