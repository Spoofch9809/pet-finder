from pydantic import BaseModel
from typing import Optional

class PetBase(BaseModel):
    name: str
    color: str
    age: Optional[int] = None
    description: Optional[str] = None

class PetCreate(PetBase):
    owner_id: int
    breed_id: int
    species_id: int

class PetUpdate(PetBase):
    pass

class PetResponse(PetBase):
    pet_id: int
    owner_id: int
    breed_id: int
    species_id: int

    class Config:
        orm_mode = True