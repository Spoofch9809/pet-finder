from fastapi import FastAPI

from backend.core.modules.post.api.post_api import router as post_router
from backend.core.modules.post.api.comment_api import router as comment_router


def register(app: FastAPI):
    app.include_router(post_router, prefix="/api", tags=["posts"])
    app.include_router(comment_router, prefix="/api", tags=["comments"])
