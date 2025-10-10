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

class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[int] = None
    address: Optional[str] = None

class UserLogin(BaseModel):
    identifier: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
