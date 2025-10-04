from core.infrastructure.db import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.dialects.mysql import MEDIUMTEXT

class User(Base):
    __tablename__ = "user"

    user_id = Column(Integer, primary_key=True, autoincrement=False)
    username = Column(String(45), nullable=False)
    password = Column(String(45), nullable=False)
    firstname = Column(String(45), nullable=False)
    lastname = Column(String(45), nullable=False)
    email = Column(String(45))
    phone = Column(Integer)
    address = Column(MEDIUMTEXT)

