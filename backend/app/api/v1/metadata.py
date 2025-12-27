from fastapi import APIRouter, Depends, HTTPException
from app.infrastructure.db_introspection import PostgresIntrospector
from app.core.config import settings

router = APIRouter(prefix="/metadata", tags=["metadata"])

def get_introspector():
    return PostgresIntrospector(settings.DATABASE_URL)

@router.get("/tables")
def list_tables(introspector: PostgresIntrospector = Depends(get_introspector)):
    return introspector.list_tables()

@router.get("/views")
def list_views(introspector: PostgresIntrospector = Depends(get_introspector)):
    return introspector.list_views()

@router.get("/objects/{object_name}")
def get_object(
    object_name: str,
    introspector: PostgresIntrospector = Depends(get_introspector)
):
    try:
        return introspector.get_object_metadata(object_name)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
