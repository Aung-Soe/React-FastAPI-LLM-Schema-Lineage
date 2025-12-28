from typing import Dict, List
from app.infrastructure.db_introspection import PostgresIntrospector
from app.infrastructure.lineage_repository import LineageRepository
from app.services.lineage_builder import LineageBuilder
from app.models.lineage import LineageNode, LineageEdge
from datetime import datetime


class SchemaScanService:
    """
    Orchestrates a full schema scan and persists lineage.
    """

    def __init__(
        self,
        introspector: PostgresIntrospector,
        lineage_repo: LineageRepository,
    ):
        self.introspector = introspector
        self.lineage_repo = lineage_repo

    def scan(self) -> Dict:
        # to add scan id generation
        scan_id = self.lineage_repo.create_scan()
        started_at = datetime.utcnow()
        tables = self.introspector.list_tables()
        views = self.introspector.list_views()

        all_nodes: Dict[str, LineageNode] = {}
        all_edges: List[LineageEdge] = []

        # Tables
        for t in tables:
            node = LineageNode(name=t["table_name"], type="table")
            all_nodes[f"table:{node.name}"] = node

        # Views + lineage
        for v in views:
            view_name = v["table_name"]
            metadata = self.introspector.get_object_metadata(view_name)

            view_node = LineageNode(name=view_name, type="view")
            all_nodes[f"view:{view_name}"] = view_node

            builder = LineageBuilder(
                view_name=view_name,
                view_sql=metadata["definition"],
            )

            edges = builder.extract_lineage()
            all_edges.extend(edges)

            for edge in edges:
                all_nodes[f"{edge.source.type}:{edge.source.name}"] = edge.source
                all_nodes[f"{edge.target.type}:{edge.target.name}"] = edge.target

        # 🔹 Persistence step (NEW)
        node_id_map = self.lineage_repo.save_nodes(scan_id, list(all_nodes.values()))
        self.lineage_repo.save_edges(scan_id, all_edges, node_id_map)

        self.lineage_repo.complete_scan(
            scan_id=scan_id,
            object_count=len(all_nodes),
        )

        completed_at = datetime.utcnow()

        return {
            "scan_id": str(scan_id),
            "status": "completed",
            "tables_count": len(tables),
            "views_count": len(views),
            "nodes_count": len(all_nodes),
            "edges_count": len(all_edges),
            "started_at": started_at.isoformat(),
            "completed_at": completed_at.isoformat(),
        }