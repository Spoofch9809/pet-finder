from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from pathlib import Path

from modules.users.api import router as users_router

app = FastAPI(title="Pet Finder")

# 1) API routes first
app.include_router(users_router, prefix="/api/users", tags=["users"])

# 2) Serve static frontend after Next.js export
STATIC_UI_DIR = Path(__file__).resolve().parent.parent / "static-ui"

if STATIC_UI_DIR.exists():
    app.mount("/", StaticFiles(directory=str(STATIC_UI_DIR), html=True), name="ui")
else:
    @app.get("/")
    def ui_not_built():
        return {"detail": "UI not built yet. Run ops/scripts/export_ui.sh"}

# # 1) Redirect root → /docs
# @app.get("/", include_in_schema=False)
# def root_to_docs():
#     return RedirectResponse(url="/docs", status_code=307)

# # 2) Serve UI (if you still want it) at /
# STATIC_UI_DIR = Path(__file__).resolve().parent.parent / "static-ui"
# if STATIC_UI_DIR.exists():
#     app.mount("/app", StaticFiles(directory=str(STATIC_UI_DIR), html=True), name="ui")