from pydantic import BaseModel
from typing import Optional

class UserResponse(BaseModel):
    user_id: int
    username: str
    firstname: str
    lastname: str
    email: Optional[str]
    phone: Optional[int]
    address: Optional[str]

    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    username: str
    password: str
    firstname: str
    lastname: str
    email: Optional[str] = None
    phone: Optional[int] = None
    address: Optional[str] = None
