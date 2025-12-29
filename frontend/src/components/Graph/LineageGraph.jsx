import React, { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";

/**
 * Props:
 * {
 *   nodes: [{ name, type, metadata }]
 *   edges: [{ source, target, relation }]
 * }
 */
export default function LineageGraph({ lineage }) {
  const { nodes = [], edges = [] } = lineage || {};

  const rfNodes = useMemo(() => {
    return nodes.map((node, index) => {
      const id = `${node.type}:${node.name}`;

      return {
        id,
        data: {
          label: node.name,
        },
        position: {
          x: 200 * (node.type === "column" ? 1 : 0),
          y: index * 80,
        },
        style: {
          padding: 10,
          borderRadius: 6,
          border: "1px solid #555",
          background:
            node.type === "table"
              ? "#e3f2fd"
              : node.type === "view"
              ? "#e8f5e9"
              : "#f5f5f5",
          fontSize: node.type === "column" ? 12 : 14,
        },
      };
    });
  }, [nodes]);

  const rfEdges = useMemo(() => {
    return edges.map((edge, index) => {
      const sourceId = `${edge.source.type}:${edge.source.name}`;
      const targetId = `${edge.target.type}:${edge.target.name}`;

      return {
        id: `e-${index}-${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        label: edge.relation,
        animated: edge.relation === "depends_on",
        style: {
          strokeWidth: 2,
        },
      };
    });
  }, [edges]);

  return (
    <div style={{ width: "100%", height: "80vh" }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
