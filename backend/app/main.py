import sys
from importlib import import_module
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

# Ensure project root is on sys.path so absolute imports work even when running from backend/app
PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

app = FastAPI(title="Pet Finder API", version="1.0.0")

# ===== CORS Configuration =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs", status_code=307)


@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend is running"}


def register_router(name: str, import_path: str, attr: str = "router", prefix: str = "/api", tags: list[str] | None = None):
    try:
        module = import_module(import_path)
        router = getattr(module, attr)
        include_kwargs = {"prefix": prefix}
        if tags is not None:
            include_kwargs["tags"] = tags
        app.include_router(router, **include_kwargs)
        print(f"[PetFinder] Registered {name} routes")
    except Exception as exc:
        print(f"[PetFinder] Failed to register {name} routes: {exc}")


# ===== Register Routers =====
register_router("user", "backend.core.modules.user.api.user_api", tags=["users"])
register_router("pet", "backend.core.modules.pets.api.pet_api", tags=["pets"])
register_router("breed", "backend.core.modules.pets.api.breed_api", attr="breed_router", tags=["breeds"])
register_router("species", "backend.core.modules.pets.api.species_api", tags=["species"])
register_router("pet photo", "backend.core.modules.pets.api.pet_photo_api", tags=["pet-photos"])
register_router("post", "backend.core.modules.post.api.post_api", tags=["posts"])
register_router("comment", "backend.core.modules.post.api.comment_api", tags=["comments"])


@app.on_event("startup")
async def startup_event():
    print("=" * 50)
    print("Pet Finder API Started")
    print("Docs available at http://localhost:8000/docs")
    print("Health check at http://localhost:8000/health")
    print("=" * 50)
