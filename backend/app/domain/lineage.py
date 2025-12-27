from dataclasses import dataclass
from typing import Optional, Dict
from uuid import UUID, uuid4

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

@dataclass(frozen=True)
class LineageGraph:
    def __init__(self):
        self.nodes: dict[tuple[str, str], LineageNode] = {}
        self.edges: list[LineageEdge] = []

    def get_or_add_node(self, node: LineageNode) -> LineageNode:
        key = (node.name, node.type)
        if key not in self.nodes:
            self.nodes[key] = node
        return self.nodes[key]

    def add_edge(self, edge: LineageEdge):
        self.edges.append(edge)

    def to_dict(self):
        return {
            "nodes": list(self.nodes.values()),
            "edges": self.edges,
        }
