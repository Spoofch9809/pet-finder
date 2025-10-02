from pydantic import BaseModel
from typing import Optional

class PetPhotoBase(BaseModel):
    picture: Optional[bytes] = None


class PetPhotoCreate(PetPhotoBase):
    pet_id: int


class PetPhotoResponse(PetPhotoBase):
    photo_id: int
    pet_id: int

    class Config:
        from_attributes = True