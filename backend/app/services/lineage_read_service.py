from typing import Dict
from app.infrastructure.lineage_repository import LineageRepository
from fastapi import HTTPException

class LineageReadService:
    def __init__(self, repo: LineageRepository):
        self.repo = repo

    def get_latest_lineage(self, version: str) -> Dict:
        scan_id = self.repo.get_latest_completed_scan_id(version)
        
        if not scan_id:
            raise HTTPException(
                status_code=404,
                detail="No completed schema scan found",
            )

        nodes = self.repo.get_nodes_for_scan(version)
        edges = self.repo.get_edges_for_scan(version)

        return {
            "scan_id": str(scan_id),
            "nodes": nodes,
            "edges": [
                {
                    "relation": e["relation"],
                    "source": {
                        "id": str(e["source_id"]),
                        "name": e["source_name"],
                        "type": e["source_type"],
                    },
                    "target": {
                        "id": str(e["target_id"]),
                        "name": e["target_name"],
                        "type": e["target_type"],
                    },
                }
                for e in edges
            ],
        }
