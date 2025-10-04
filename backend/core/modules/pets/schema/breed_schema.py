from pydantic import BaseModel

class BreedBase(BaseModel):
    breed: str

class BreedCreate(BreedBase):
    pass

class BreedResponse(BreedBase):
    breed_id: int

    class Config:
        orm_mode = True
