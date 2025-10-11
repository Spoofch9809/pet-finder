import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from starlette.staticfiles import StaticFiles

# Ensure project root is on sys.path so absolute imports work even when running from backend/app
PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

app = FastAPI(title="Pet Finder API", version="1.0.0")

# Determine if we have a built frontend to embed
FRONTEND_OUT = PROJECT_ROOT / "frontend" / "out"
EMBED_UI = FRONTEND_OUT.exists()

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


if not EMBED_UI:
    @app.get("/", include_in_schema=False)
    def root():
        return RedirectResponse(url="/docs", status_code=307)


@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend is running"}


# ===== Microkernel: Load Python plugins =====
from backend.core.plugin_manager import PluginManager

PLUGINS_DIR = Path(__file__).resolve().parents[1] / "plugins"
pm = PluginManager(PLUGINS_DIR)
pm.discover_python_plugins(package_root_name="backend.plugins")
pm.register_all(app)

# Keep native plugin loading (if any)
pm.load_native_libs()


@app.on_event("startup")
async def startup_event():
    print("=" * 50)
    print("Pet Finder API Started")
    print("Docs available at http://localhost:8000/docs")
    print("Health check at http://localhost:8000/health")
    print("=" * 50)

# ===== Embedded UI (serve built Next.js export) =====
# If the frontend has been exported via `npm run export`, serve it from the backend.
if EMBED_UI:
    try:
        app.mount("/", StaticFiles(directory=str(FRONTEND_OUT), html=True), name="ui")
        print(f"[PetFinder] Embedded UI mounted from: {FRONTEND_OUT}")
    except Exception as exc:
        print(f"[PetFinder] Failed to mount embedded UI: {exc}")
