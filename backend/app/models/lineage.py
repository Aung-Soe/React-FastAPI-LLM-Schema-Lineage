# app/models/lineage.py
from dataclasses import dataclass
from typing import Optional, Dict, List, Tuple


@dataclass(frozen=True)
class LineageNode:
    name: str
    type: str  # table | view | column
    metadata: Optional[Dict] = None


@dataclass(frozen=True)
class LineageEdge:
    source: LineageNode
    target: LineageNode
    relation: str  # depends_on | derives_from
    metadata: Optional[Dict] = None


class LineageGraph:
    """
    In-memory lineage graph used during a scan.
    """

    def __init__(self):
        self.nodes: dict[Tuple[str, str], LineageNode] = {}
        self.edges: List[LineageEdge] = []

    def get_or_add_node(self, node: LineageNode) -> LineageNode:
        key = (node.name, node.type)
        if key not in self.nodes:
            self.nodes[key] = node
        return self.nodes[key]

    def add_edge(self, edge: LineageEdge):
        self.edges.append(edge)

    def to_dict(self):
        return {
            "nodes": [n.__dict__ for n in self.nodes.values()],
            "edges": [e.__dict__ for e in self.edges],
        }
