import { useEffect, useState } from "react";
import { ReactFlowProvider } from "reactflow";
import LineageGraph from "../components/Graph/LineageGraph";
import ColumnPanel from "../components/Layout/ColumnPanel";
import LeftPanel from "../components/Layout/LeftPanel";
import TopBar from "../components/Layout/TopBar";

const API_URL = import.meta.env.VITE_API_URL;

export default function Lineage() {
  const [lineage, setLineage] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [version, setVersion] = useState("latest");

  useEffect(() => {
    setSelectedNode(null); // 👈 reset selection on version change

    fetch(`${API_URL}/api/v1/lineage/${version}`)
      .then(res => res.json())
      .then(setLineage)
      .catch(console.error);
  }, [version]);

  if (!lineage) {
    return <div style={{ padding: 20 }}>Loading lineage...</div>;
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <TopBar />
      <div style={{ flex: 1, display: "flex" }}>
        {/* Left Panel */}
        <LeftPanel version={version} 
          onVersionChange={setVersion} 
          selectedNode={selectedNode}
        />
        {/* Graph */}
        <div style={{ flex: 1 }}>
          <ReactFlowProvider>
            <LineageGraph
              lineage={lineage}
              onNodeSelect={setSelectedNode}
            />
          </ReactFlowProvider>
        </div>
        {/* Column Panel (ONLY show when node selected) */}
        {selectedNode && (
          <ColumnPanel
            lineage={lineage}
            selectedNode={selectedNode}
          />
        )}
      </div>
    </div>
  );
}
