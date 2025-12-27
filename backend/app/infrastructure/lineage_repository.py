# app/infrastructure/lineage_repository.py
from typing import List, Dict, Tuple
from uuid import uuid4, UUID
from datetime import datetime
from sqlalchemy import text, Engine
from app.infrastructure.db import get_engine
from app.domain.lineage import LineageNode, LineageEdge


class LineageRepository:
    def __init__(self, engine: Engine | None = None):
        self.engine = engine or get_engine()

    # -------------------------
    # Schema scan lifecycle
    # -------------------------

    def create_scan(self) -> UUID:
        scan_id = uuid4()

        with self.engine.begin() as conn:
            conn.execute(
                text("""
                    INSERT INTO schema_scans (
                        id, started_at, status
                    )
                    VALUES (
                        :id, :started_at, 'running'
                    )
                """),
                {
                    "id": scan_id,
                    "started_at": datetime.utcnow(),
                },
            )

        return scan_id

    def complete_scan(self, scan_id: UUID, object_count: int):
        with self.engine.begin() as conn:
            conn.execute(
                text("""
                    UPDATE schema_scans
                    SET completed_at = :completed_at,
                        status = 'completed',
                        object_count = :object_count
                    WHERE id = :id
                """),
                {
                    "id": scan_id,
                    "completed_at": datetime.utcnow(),
                    "object_count": object_count,
                },
            )

    # -------------------------
    # Nodes
    # -------------------------

    def save_nodes(
        self,
        scan_id: UUID,
        nodes: List[LineageNode],
    ) -> Dict[Tuple[str, str], UUID]:
        """
        Persists nodes and returns mapping:
        (name, type) -> node_id
        """
        node_ids: Dict[Tuple[str, str], UUID] = {}

        with self.engine.begin() as conn:
            for node in nodes:
                node_id = uuid4()

                conn.execute(
                    text("""
                        INSERT INTO lineage_nodes (
                            id, scan_id, name, type, metadata
                        )
                        VALUES (
                            :id, :scan_id, :name, :type, :metadata
                        )
                        ON CONFLICT (scan_id, name, type)
                        DO NOTHING
                    """),
                    {
                        "id": node_id,
                        "scan_id": scan_id,
                        "name": node.name,
                        "type": node.type,
                        "metadata": node.metadata,
                    },
                )

                # Fetch canonical ID (inserted or existing)
                result = conn.execute(
                    text("""
                        SELECT id
                        FROM lineage_nodes
                        WHERE scan_id = :scan_id
                          AND name = :name
                          AND type = :type
                    """),
                    {
                        "scan_id": scan_id,
                        "name": node.name,
                        "type": node.type,
                    },
                ).scalar_one()

                node_ids[(node.name, node.type)] = result

        return node_ids

    # -------------------------
    # Edges
    # -------------------------

    def save_edges(
        self,
        scan_id: UUID,
        edges: List[LineageEdge],
        node_id_map: Dict[Tuple[str, str], UUID],
    ):
        with self.engine.begin() as conn:
            for edge in edges:
                conn.execute(
                    text("""
                        INSERT INTO lineage_edges (
                            id,
                            scan_id,
                            source_node_id,
                            target_node_id,
                            relation,
                            metadata
                        )
                        VALUES (
                            :id,
                            :scan_id,
                            :source_node_id,
                            :target_node_id,
                            :relation,
                            NULL
                        )
                    """),
                    {
                        "id": uuid4(),
                        "scan_id": scan_id,
                        "source_node_id": node_id_map[
                            (edge.source.name, edge.source.type)
                        ],
                        "target_node_id": node_id_map[
                            (edge.target.name, edge.target.type)
                        ],
                        "relation": edge.relation,
                    },
                )