from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "mysql+pymysql://root:OS1234@localhost:3306/sda_database"

engine = create_engine(DATABASE_URL, echo=True)

Base = declarative_base()

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommut=False)

def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

