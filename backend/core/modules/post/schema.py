from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class PetBase(BaseModel):
    name: str
    bread: str
    species: str
    color: str
    age: Optional[int] = None
    description: Optional[str] = None