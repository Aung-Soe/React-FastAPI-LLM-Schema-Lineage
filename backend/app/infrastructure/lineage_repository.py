# app/infrastructure/lineage_repository.py
from typing import List, Dict, Tuple, Optional
from uuid import uuid4, UUID
from datetime import datetime
from sqlalchemy import text, Engine
from app.infrastructure.db import get_engine
from app.models.lineage import LineageNode, LineageEdge
import json


class LineageRepository:
    def __init__(self, engine: Engine | None = None):
        self.engine = engine or get_engine()
    
    #-------------------------
    # Scan End Points
    #-------------------------

    def get_latest_completed_scan_id(self, version: str) -> Optional[UUID]:
        sql = """
        SELECT id
        FROM schema_scans
        WHERE status = 'completed' 
        AND version = :version
        ORDER BY completed_at DESC
        LIMIT 1
        """
        with self.engine.connect() as conn:
            row = conn.execute(text(sql), {"version": version}).fetchone()
            return row[0] if row else None

    def get_nodes_for_scan(self, version: str) -> List[Dict]:
        sql = """
        SELECT id, name, type, metadata
        FROM lineage_nodes
        WHERE version = :version
        """
        with self.engine.connect() as conn:
            result = conn.execute(text(sql), {"version": version})
            return [dict(row) for row in result.mappings()]


    def get_edges_for_scan(self, version: str) -> List[Dict]:
        sql = """
        SELECT
            e.id,
            e.relation,
            s.id AS source_id,
            s.name AS source_name,
            s.type AS source_type,
            t.id AS target_id,
            t.name AS target_name,
            t.type AS target_type
        FROM lineage_edges e
        JOIN lineage_nodes s ON e.source_node_id = s.id
        JOIN lineage_nodes t ON e.target_node_id = t.id
        WHERE e.version = :version
        """
        with self.engine.connect() as conn:
            result = conn.execute(text(sql), {"version": version})
            return [dict(row) for row in result.mappings()]

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
                        object_count = :object_count,
                        version = 'latest'
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

    def save_nodes(self, scan_id, nodes, version="latest"):
        node_id_map = {}

        with self.engine.begin() as conn:
            for node in nodes:
                node_id = uuid4()
                node_id_map[(node.name, node.type)] = node_id

                conn.execute(
                    text("""
                    INSERT INTO lineage_nodes (
                        id, scan_id, name, type, metadata, version
                    )
                    VALUES (
                        :id, :scan_id, :name, :type, :metadata, :version
                    )
                    ON CONFLICT (scan_id, name, type) DO NOTHING
                    """),
                    {
                        "id": node_id,
                        "scan_id": scan_id,
                        "name": node.name,
                        "type": node.type,
                        "metadata": json.dumps(node.metadata) if node.metadata else None,
                        "version": version,
                    },
                )

        return node_id_map

    # -------------------------
    # Edges
    # -------------------------

    def save_edges(self, scan_id, edges, node_id_map, version="latest"):
        with self.engine.begin() as conn:
            for edge in edges:
                conn.execute(
                    text("""
                    INSERT INTO lineage_edges (
                        id, scan_id,
                        source_node_id,
                        target_node_id,
                        relation,
                        metadata,
                        version
                    )
                    VALUES (
                        :id, :scan_id,
                        :source_id,
                        :target_id,
                        :relation,
                        :metadata,
                        :version
                    )
                    """),
                    {
                        "id": uuid4(),
                        "scan_id": scan_id,
                        "source_id": node_id_map[(edge.source.name, edge.source.type)],
                        "target_id": node_id_map[(edge.target.name, edge.target.type)],
                        "relation": edge.relation,
                        "metadata": None,
                        "version": version,
                    },
                )
    
    # -------------------------
    # Rotate Versions
    # -------------------------
    def rotate_versions(self):
        """
        latest → L2
        L2 → L1
        L1 → deleted
        """
        with self.engine.begin() as conn:
            # Delete oldest
            conn.execute(text("""
                DELETE FROM schema_scans WHERE status = 'completed' AND version = 'L1';              
                DELETE FROM lineage_edges WHERE version = 'L1';
                DELETE FROM lineage_nodes WHERE version = 'L1';
            """))

            # Shift versions
            conn.execute(text("""
                UPDATE schema_scans SET version = 'L1' WHERE version = 'L2' and status = 'completed';
                UPDATE lineage_edges SET version = 'L1' WHERE version = 'L2';
                UPDATE lineage_nodes SET version = 'L1' WHERE version = 'L2';

                UPDATE schema_scans SET version = 'L2' WHERE version = 'latest' and status = 'completed';
                UPDATE lineage_edges SET version = 'L2' WHERE version = 'latest';
                UPDATE lineage_nodes SET version = 'L2' WHERE version = 'latest';
            """))