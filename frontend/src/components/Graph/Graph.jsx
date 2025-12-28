import React from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

export default function Graph({ nodes, edges }) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      fitView
      nodesDraggable
      nodesConnectable={false}
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}