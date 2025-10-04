from pydantic import BaseModel
from typing import Optional

class PetPhotoBase(BaseModel):
    pet_id: int
    picture: bytes

class PetPhotoCreate(PetPhotoBase):
    pass

class PetPhotoResponse(PetPhotoBase):
    photo_id: int

    class Config:
        orm_mode = True