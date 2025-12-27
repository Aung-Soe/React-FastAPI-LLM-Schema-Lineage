# app/api/v1/lineage.py
# app/api/v1/lineage.py
from fastapi import APIRouter, HTTPException, Depends

from app.infrastructure.db_introspection import PostgresIntrospector
from app.services.lineage_builder import LineageBuilder
from app.core.config import settings

router = APIRouter(prefix="/lineage", tags=["lineage"])


def get_introspector():
    return PostgresIntrospector()


@router.get("/{view_name}")
def get_lineage(
    view_name: str,
    introspector: PostgresIntrospector = Depends(get_introspector),
    ):
    metadata = introspector.get_object_metadata(view_name)

    if metadata["type"] != "view":
        raise HTTPException(status_code=400, detail="Object is not a view")

    builder = LineageBuilder(
        view_name=view_name,
        view_sql=metadata["definition"],
    )

    graph = builder.extract_graph()

    return {
        "view": view_name,
        "nodes": [node.__dict__ for node in graph["nodes"]],
        "edges": [edge.__dict__ for edge in graph["edges"]],
    }
