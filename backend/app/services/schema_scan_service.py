# app/services/schema_scan_service.py

from datetime import datetime
from typing import Dict, List

from app.infrastructure.db_introspection import PostgresIntrospector
from app.infrastructure.lineage_repository import LineageRepository
from app.services.lineage_builder import LineageBuilder
from app.models.lineage import LineageNode, LineageEdge


class SchemaScanService:
    def __init__(self, introspector, lineage_repo):
        self.introspector = introspector
        self.lineage_repo = lineage_repo

    def scan(self) -> Dict:
        self.lineage_repo.rotate_versions()
        scan_id = self.lineage_repo.create_scan()
        started_at = datetime.utcnow()

        tables = self.introspector.list_tables()
        views = self.introspector.list_views()

        all_nodes: Dict[str, LineageNode] = {}
        all_edges: List[LineageEdge] = []

        # ---------- TABLE NODES ----------
        for t in tables:
            table_name = t["table_name"]
            node = LineageNode(
                name=table_name,
                type="table",
                metadata=self.introspector.get_object_metadata(table_name),
            )
            all_nodes[f"table:{table_name}"] = node

        # ---------- VIEW NODES ----------
        for v in views:
            view_name = v["table_name"]
            metadata = self.introspector.get_object_metadata(view_name)

            node = LineageNode(
                name=view_name,
                type="view",
                metadata=metadata,
            )
            all_nodes[f"view:{view_name}"] = node

        # ---------- COLUMNS ----------
        def add_columns(parent_name, parent_type):
            columns = self.introspector.list_columns(parent_name)
            parent = all_nodes[f"{parent_type}:{parent_name}"]

            for c in columns:
                col_node = LineageNode(
                    name=f"{parent_name}.{c['column_name']}",
                    type="column",
                    metadata={
                        "data_type": c["data_type"],
                        "is_nullable": c["is_nullable"],
                        "ordinal_position": c["ordinal_position"],
                        "parent": parent_name,
                    },
                )
                all_nodes[f"column:{col_node.name}"] = col_node
                all_edges.append(
                    LineageEdge(
                        source=col_node,
                        target=parent,
                        relation="belongs_to",
                    )
                )

        for t in tables:
            add_columns(t["table_name"], "table")

        for v in views:
            add_columns(v["table_name"], "view")

        # ---------- VIEW DEPENDENCIES ----------
        for v in views:
            view_name = v["table_name"]
            view_node = all_nodes[f"view:{view_name}"]

            builder = LineageBuilder(
                view_name=view_name,
                view_sql=self.introspector.get_object_metadata(view_name)["definition"],
            )

            # Object dependencies (table OR view)
            for dep in builder.extract_object_dependencies():
                if f"table:{dep}" in all_nodes:
                    source = all_nodes[f"table:{dep}"]
                elif f"view:{dep}" in all_nodes:
                    source = all_nodes[f"view:{dep}"]
                else:
                    continue  # ignore unknown objects

                all_edges.append(
                    LineageEdge(
                        source=source,
                        target=view_node,
                        relation="depends_on",
                    )
                )

            # Column dependencies
            for src, tgt in builder.extract_column_dependencies():
                if f"column:{src}" in all_nodes and f"column:{tgt}" in all_nodes:
                    all_edges.append(
                        LineageEdge(
                            source=all_nodes[f"column:{src}"],
                            target=all_nodes[f"column:{tgt}"],
                            relation="derives_from",
                        )
                    )

        # ---------- SAVE ----------
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