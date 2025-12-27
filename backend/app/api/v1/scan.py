# app/api/v1/scan.py
from fastapi import APIRouter, Depends
from app.infrastructure.db_introspection import PostgresIntrospector
from app.infrastructure.lineage_repository import LineageRepository
from app.services.schema_scan_service import SchemaScanService
from app.core.config import settings


router = APIRouter(prefix="/scan", tags=["scan"])


def get_introspector():
    return PostgresIntrospector()


def get_lineage_repository():
    return LineageRepository()

@router.post("")
def run_schema_scan(
    introspector: PostgresIntrospector = Depends(get_introspector),
    lineage_repo: LineageRepository = Depends(get_lineage_repository),
):
    service = SchemaScanService(
        introspector=introspector,
        lineage_repo=lineage_repo,
    )
    return service.scan()
