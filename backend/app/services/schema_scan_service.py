from typing import Dict, List
from app.infrastructure.db_introspection import PostgresIntrospector
from app.infrastructure.lineage_repository import LineageRepository
from app.services.lineage_builder import LineageBuilder
from app.models.lineage import LineageNode, LineageEdge
from datetime import datetime


class SchemaScanService:
    def __init__(
        self,
        introspector: PostgresIntrospector,
        lineage_repo: LineageRepository,
    ):
        self.introspector = introspector
        self.lineage_repo = lineage_repo

    def scan(self) -> Dict:
        scan_id = self.lineage_repo.create_scan()
        started_at = datetime.utcnow()

        tables = self.introspector.list_tables()
        views = self.introspector.list_views()

        all_nodes: Dict[str, LineageNode] = {}
        all_edges: List[LineageEdge] = []

        # ---------- TABLES ----------
        for t in tables:
            metadata = self.introspector.get_object_metadata(t["table_name"])

            table_node = LineageNode(
                name=t["table_name"],
                type="table",
                metadata=metadata,  # ✅ FIX
            )
            all_nodes[f"table:{table_node.name}"] = table_node

            # Add column nodes
            for col in metadata["columns"]:
                col_node = LineageNode(
                    name=f'{t["table_name"]}.{col["column_name"]}',
                    type="column",
                    metadata=col,  # ✅ FIX
                )
                all_nodes[f"column:{col_node.name}"] = col_node

        # ---------- VIEWS ----------
        for v in views:
            view_metadata = self.introspector.get_object_metadata(v["table_name"])

            view_node = LineageNode(
                name=v["table_name"],
                type="view",
                metadata=view_metadata,  # ✅ FIX
            )
            all_nodes[f"view:{view_node.name}"] = view_node

            # View columns
            for col in view_metadata["columns"]:
                col_node = LineageNode(
                    name=f'{v["table_name"]}.{col["column_name"]}',
                    type="column",
                    metadata=col,  # ✅ FIX
                )
                all_nodes[f"column:{col_node.name}"] = col_node

            # Lineage edges
            builder = LineageBuilder(
                view_name=v["table_name"],
                view_sql=view_metadata["definition"],
            )

            edges = builder.extract_lineage()
            all_edges.extend(edges)

            for edge in edges:
                all_nodes[f"{edge.source.type}:{edge.source.name}"] = edge.source
                all_nodes[f"{edge.target.type}:{edge.target.name}"] = edge.target

        # ---------- PERSIST ----------
        node_id_map = self.lineage_repo.save_nodes(
            scan_id,
            list(all_nodes.values()),
        )

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