from typing import List, Dict, Set
import sqlglot
from sqlglot.expressions import Column, Table

from app.models.lineage import LineageNode, LineageEdge


class LineageBuilder:
    """
    Phase 1: View → Table/View lineage
    Phase 2: Column → Column lineage
    """

    def __init__(self, view_name: str, view_sql: str):
        self.view_name = view_name
        self.view_sql = view_sql
        self.ast = sqlglot.parse_one(view_sql)

    # -------------------------
    # Phase 1: Object lineage
    # -------------------------

    def extract_object_lineage(self) -> List[LineageEdge]:
        edges: List[LineageEdge] = []

        for table in self.ast.find_all(Table):
            edges.append(
                LineageEdge(
                    source=LineageNode(name=table.name, type="table"),
                    target=LineageNode(name=self.view_name, type="view"),
                    relation="depends_on",
                )
            )

        return edges

    # -------------------------
    # Phase 2: Column lineage
    # -------------------------

    def extract_column_lineage(self) -> List[LineageEdge]:
        edges: List[LineageEdge] = []

        for col in self.ast.find_all(Column):
            if not col.table:
                continue

            edges.append(
                LineageEdge(
                    source=LineageNode(
                        name=f"{col.table}.{col.name}",
                        type="column",
                    ),
                    target=LineageNode(
                        name=f"{self.view_name}.{col.alias_or_name}",
                        type="column",
                    ),
                    relation="derives_from",
                )
            )

        return edges

    # -------------------------
    # Graph-level API (FIX)
    # -------------------------

    def extract_graph(self) -> Dict[str, List]:
        """
        Returns a graph structure:
        {
            nodes: [...],
            edges: [...]
        }
        """

        edges = self.extract_object_lineage() + self.extract_column_lineage()

        node_map: Dict[str, LineageNode] = {}

        for edge in edges:
            for node in (edge.source, edge.target):
                key = f"{node.type}:{node.name}"
                if key not in node_map:
                    node_map[key] = node

        return {
            "nodes": list(node_map.values()),
            "edges": edges,
        }
    
    def extract_lineage(self):
        return self.extract_object_lineage() + self.extract_column_lineage()
