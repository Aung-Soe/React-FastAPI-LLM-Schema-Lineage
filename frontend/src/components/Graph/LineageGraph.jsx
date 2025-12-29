import { useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";

function buildGraph(lineage) {
  const nodes = [];
  const edges = [];

  lineage.nodes.forEach((node) => {
    if (node.type === "table" || node.type === "view") {
      nodes.push({
        id: `${node.type}:${node.name}`,
        data: { label: node.name },
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        type: "default",
      });
    }
  });

  lineage.edges.forEach((edge, index) => {
    const sourceId = `${edge.source.type}:${edge.source.name}`;
    const targetId = `${edge.target.type}:${edge.target.name}`;

    edges.push({
      id: `e-${index}`,
      source: sourceId,
      target: targetId,
      animated: true,
      style: { strokeDasharray: "4 2" },
    });
  });

  return { nodes, edges };
}

export default function LineageGraph({ lineage }) {
  const { nodes: allNodes, edges: allEdges } = useMemo(
    () => buildGraph(lineage),
    [lineage]
  );

  const [focusedNode, setFocusedNode] = useState(null);

  const visibleGraph = useMemo(() => {
    if (!focusedNode) {
      return { nodes: allNodes, edges: allEdges };
    }

    const connectedNodeIds = new Set();
    connectedNodeIds.add(focusedNode);

    allEdges.forEach((edge) => {
      if (edge.source === focusedNode || edge.target === focusedNode) {
        connectedNodeIds.add(edge.source);
        connectedNodeIds.add(edge.target);
      }
    });

    return {
      nodes: allNodes.filter((n) => connectedNodeIds.has(n.id)),
      edges: allEdges.filter(
        (e) =>
          connectedNodeIds.has(e.source) &&
          connectedNodeIds.has(e.target)
      ),
    };
  }, [focusedNode, allNodes, allEdges]);

  return (
    <div style={{ height: "80vh", border: "1px solid #ddd" }}>
      <ReactFlow
        nodes={visibleGraph.nodes}
        edges={visibleGraph.edges}
        onNodeClick={(_, node) => setFocusedNode(node.id)}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>

      {focusedNode && (
        <div style={{ padding: 8 }}>
          <button onClick={() => setFocusedNode(null)}>
            Reset focus
          </button>
        </div>
      )}
    </div>
  );
}
