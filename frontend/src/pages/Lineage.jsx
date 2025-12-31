import { useEffect, useState } from "react";
import LineageGraph from "../components/Graph/LineageGraph";
import ColumnPanel from "../components/Layout/ColumnPanel";
import LeftPanel from "../components/Layout/LeftPanel";

const API_URL = import.meta.env.VITE_API_URL;

export default function Lineage() {
  const [lineage, setLineage] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [version, setVersion] = useState("latest");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setLineage(null);

    fetch(`${API_URL}/api/v1/lineage/${version}`)
      .then((res) => res.json())
      .then((data) => {
        setLineage(data);
        setSelectedNode(null); // reset selection on version switch
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [version]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left side pane */}
      <LeftPanel
        selectedVersion={version}
        onVersionChange={setVersion}
      />

      {/* Main graph area */}
      <div style={{ flex: 1, position: "relative" }}>
        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.7)",
              zIndex: 10,
            }}
          >
            Loading lineage…
          </div>
        )}

        {lineage && (
          <LineageGraph
            lineage={lineage}
            onNodeSelect={setSelectedNode}
          />
        )}
      </div>

      {/* Right side column panel */}
      <ColumnPanel
        lineage={lineage}
        selectedNode={selectedNode}
      />
    </div>
  );
}
