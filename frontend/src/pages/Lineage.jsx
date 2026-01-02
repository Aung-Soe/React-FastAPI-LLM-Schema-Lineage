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
  const [chatActive, setChatActive] = useState(false);
  const [chatKey, setChatKey] = useState(0); // used to reset chat


  useEffect(() => {
    setSelectedNode(null); // 👈 reset selection on version change

    fetch(`${API_URL}/api/v1/lineage/${version}`)
      .then(res => res.json())
      .then(setLineage)
      .catch(console.error);
  }, [version]);

  function handleCanvasClick() {
    setSelectedNode(null);
    setChatActive(false);
    setChatKey(k => k + 1); // force reset
}

  if (!lineage) {
    return <div style={{ padding: 20 }}>Loading lineage...</div>;
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <TopBar />
      <div style={{ flex: 1, display: "flex" }}>
        {/* Left Panel */}
        <LeftPanel 
          version={version} 
          onVersionChange={setVersion} 
          selectedNode={selectedNode}
          chatActive={chatActive}
          setChatActive={setChatActive}
          chatKey={chatKey}
        />
        {/* Graph */}
        <div style={{ flex: 1 }}>
          <ReactFlowProvider>
            <LineageGraph
              lineage={lineage}
              onNodeSelect={(node) => {
                setSelectedNode(node);
                setChatActive(false);
              }}
              onCanvasClick={handleCanvasClick}
            />
          </ReactFlowProvider>
        </div>
        {/* Column Panel (ONLY show when node selected) */}
        {!chatActive && selectedNode && (
          <ColumnPanel
            lineage={lineage}
            selectedNode={selectedNode}
          />
        )}
      </div>
    </div>
  );
}
