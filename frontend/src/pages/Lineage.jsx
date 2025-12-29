import { useEffect, useState } from "react";
import LineageGraph from "../components/Graph/LineageGraph";
import { transformLineageToGraph } from "../utils/lineageTransform";

export default function Lineage() {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/lineage/latest`)
      .then(res => res.json())
      .then(data => {
        setGraph(transformLineageToGraph(data));
      });
  }, []);

  const handleNodeClick = (node) => {
    console.log("Selected:", node.id);
    // next step: focus graph + show columns
  };

  return (
    <div style={{ height: "100vh" }}>
      <LineageGraph
        nodes={graph.nodes}
        edges={graph.edges}
        onNodeClick={handleNodeClick}
      />
    </div>
  );
}
