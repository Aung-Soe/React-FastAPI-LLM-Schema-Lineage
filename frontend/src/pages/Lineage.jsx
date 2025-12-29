import { useEffect, useState } from "react";
import LineageGraph from "../components/Graph/LineageGraph";
import ColumnPanel from "../components/Layout/ColumnPanel";

const API_URL = import.meta.env.VITE_API_URL;

export default function Lineage() {
  const [lineage, setLineage] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/lineage/latest`)
      .then(res => res.json())
      .then(setLineage)
      .catch(console.error);
  }, []);

  if (!lineage) return <div>Loading lineage...</div>;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Graph area */}
      <div style={{ flex: 1 }}>
        <LineageGraph
          lineage={lineage}
          selectedNode={selectedNode}
          onNodeSelect={setSelectedNode}
        />
      </div>

      {/* Right side column panel */}
      <ColumnPanel
        lineage={lineage}
        selectedNode={selectedNode}
      />
    </div>
  );
}
