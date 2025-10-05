from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

app = FastAPI(title="Pet Finder API", version="1.0.0")

# ===== CORS Configuration (MUST BE FIRST) =====
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

# ===== Basic Routes =====
@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs", status_code=307)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend is running"}

# ===== Import and Register Routers =====
try:
    from core.modules.user.api.user_api import router as user_router
    app.include_router(user_router, prefix="/api", tags=["users"])
    print("✓ User router registered")
except Exception as e:
    print(f"✗ Failed to load user router: {e}")

try:
    from core.modules.pets.api.pet_api import router as pet_router
    app.include_router(pet_router, prefix="/api", tags=["pets"])
    print("✓ Pet router registered")
except Exception as e:
    print(f"✗ Failed to load pet router: {e}")

try:
    from core.modules.pets.api.breed_api import breed_router
    app.include_router(breed_router, prefix="/api", tags=["breeds"])
    print("✓ Breed router registered")
except Exception as e:
    print(f"✗ Failed to load breed router: {e}")

try:
    from core.modules.pets.api.species_api import router as species_router
    app.include_router(species_router, prefix="/api", tags=["species"])
    print("✓ Species router registered")
except Exception as e:
    print(f"✗ Failed to load species router: {e}")

try:
    from core.modules.pets.api.pet_photo_api import router as pet_photo_router
    app.include_router(pet_photo_router, prefix="/api", tags=["pet-photos"])
    print("✓ Pet photo router registered")
except Exception as e:
    print(f"✗ Failed to load pet photo router: {e}")

try:
    from core.modules.post.api.post_api import router as post_router
    app.include_router(post_router, prefix="/api", tags=["posts"])
    print("✓ Post router registered")
except Exception as e:
    print(f"✗ Failed to load post router: {e}")

try:
    from core.modules.post.api.comment_api import router as comment_router
    app.include_router(comment_router, prefix="/api", tags=["comments"])
    print("✓ Comment router registered")
except Exception as e:
    print(f"✗ Failed to load comment router: {e}")

@app.on_event("startup")
async def startup_event():
    print("=" * 50)
    print("🚀 Pet Finder API Started")
    print("📝 Docs: http://localhost:8000/docs")
    print("❤️  Health: http://localhost:8000/health")
    print("=" * 50)