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
        # rotate old lineage first
        self.lineage_repo.rotate_versions()

        scan_id = self.lineage_repo.create_scan()
        started_at = datetime.utcnow()

        tables = self.introspector.list_tables()
        views = self.introspector.list_views()

        all_nodes = {}
        all_edges = []

        # Tables
        for t in tables:
            node = LineageNode(
                name=t["table_name"],
                type="table",
                metadata=self.introspector.get_object_metadata(t["table_name"]),
            )
            all_nodes[f"table:{node.name}"] = node

            columns = self.introspector.list_columns(t["table_name"])

            for col in columns:
                col_node = LineageNode(
                    name=f"{t['table_name']}.{col['column_name']}",
                    type="column",
                    metadata={
                        "data_type": col["data_type"],
                        "nullable": col["is_nullable"],
                        "position": col["ordinal_position"],
                    },
                )

                all_nodes[f"column:{col_node.name}"] = col_node

                all_edges.append(
                    LineageEdge(
                        source=col_node,
                        target=node,
                        relation="belongs_to",
                    )
                )

        # Views
        for v in views:
            view_name = v["table_name"]
            metadata = self.introspector.get_object_metadata(view_name)

            view_node = LineageNode(
                name=view_name,
                type="view",
                metadata=metadata,
            )
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

        node_id_map = self.lineage_repo.save_nodes(
            scan_id, list(all_nodes.values()), version="latest"
        )

        self.lineage_repo.save_edges(
            scan_id, all_edges, node_id_map, version="latest"
        )

        self.lineage_repo.complete_scan(scan_id, object_count=len(all_nodes))

        return {
            "scan_id": str(scan_id),
            "status": "completed",
            "nodes_count": len(all_nodes),
            "edges_count": len(all_edges),
            "started_at": started_at.isoformat(),
            "completed_at": datetime.utcnow().isoformat(),
        }
