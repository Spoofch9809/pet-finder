from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "mysql+pymysql://root:Peam56201@localhost:3306/sda_database"

engine = create_engine(DATABASE_URL, echo=True)

Base = declarative_base()

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Import models to register mappings with the shared Base
import importlib

for module_path in [
    'core.modules.user.models.user_model',
    'core.modules.pets.models.pet_model',
    'core.modules.pets.models.species_model',
    'core.modules.pets.models.bread_model',
    'core.modules.pets.models.pet_photo_model',
    'core.modules.post.models.post_model',
    'core.modules.post.models.post_picture_model',
    'core.modules.post.models.comment_model',
    'core.modules.post.models.comment_picture_model',
]:
    importlib.import_module(module_path)

