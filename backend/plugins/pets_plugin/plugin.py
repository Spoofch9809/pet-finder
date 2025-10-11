from fastapi import FastAPI

from backend.core.modules.pets.api.pet_api import router as pet_router
from backend.core.modules.pets.api.pet_photo_api import router as pet_photo_router
from backend.core.modules.pets.api.species_api import router as species_router
from backend.core.modules.pets.api.breed_api import breed_router


def register(app: FastAPI):
    app.include_router(pet_router, prefix="/api", tags=["pets"])
    app.include_router(breed_router, prefix="/api", tags=["breeds"])
    app.include_router(species_router, prefix="/api", tags=["species"])
    app.include_router(pet_photo_router, prefix="/api", tags=["pet-photos"])
