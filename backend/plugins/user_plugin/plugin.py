from fastapi import FastAPI

try:
    from backend.core.modules.user.api.user_api import router as user_router
except Exception as e:
    raise


def register(app: FastAPI):
    app.include_router(user_router, prefix="/api", tags=["users"])
