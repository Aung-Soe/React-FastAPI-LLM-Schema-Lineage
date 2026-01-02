# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import health, metadata, lineage, scan, chat
from app.core.config import settings

def create_app() -> FastAPI:
    app = FastAPI(
        title="Schema Lineage Backend",
        version="0.1.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",  # frontend
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router, prefix="/api/v1")
    app.include_router(metadata.router, prefix="/api/v1")
    app.include_router(lineage.router, prefix="/api/v1")
    app.include_router(scan.router, prefix="/api/v1")
    app.include_router(chat.router, prefix="/api/v1")
    

    return app

app = create_app()


