# app/main.py
from fastapi import FastAPI
from app.api.v1 import health, metadata, lineage, scan
from app.core.config import settings

def create_app() -> FastAPI:
    app = FastAPI(
        title="Schema Lineage Backend",
        version="0.1.0",
    )

    app.include_router(health.router, prefix="/api/v1")
    app.include_router(metadata.router, prefix="/api/v1")
    app.include_router(lineage.router, prefix="/api/v1")
    app.include_router(scan.router, prefix="/api/v1")
    

    return app

app = create_app()
