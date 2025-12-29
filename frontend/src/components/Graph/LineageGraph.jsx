import ReactFlow from "reactflow";
import "reactflow/dist/style.css";
import TableNode from "./TableNode";

const nodeTypes = {
  tableNode: TableNode
};

export default function LineageGraph({ nodes, edges, onNodeClick }) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      onNodeClick={(_, node) => onNodeClick(node)}
    />
  );
}
