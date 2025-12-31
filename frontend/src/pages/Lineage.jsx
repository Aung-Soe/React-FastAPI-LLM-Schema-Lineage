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
    let cancelled = false;

    setLoading(true);
    setSelectedNode(null); // 🔥 CRITICAL RESET

    fetch(`${API_URL}/api/v1/lineage/${version}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setLineage(data);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [version]);

  if (loading || !lineage) {
    return <div style={{ padding: 20 }}>Loading lineage...</div>;
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left panel */}
      <LeftPanel
        version={version}
        onVersionChange={setVersion}
      />

      {/* Graph */}
      <div style={{ flex: 1 }}>
        <LineageGraph
          key={version}              // 🔥 FORCE REMOUNT
          lineage={lineage}
          onNodeSelect={setSelectedNode}
        />
      </div>

      {/* Right panel */}
      <ColumnPanel
        lineage={lineage}
        selectedNode={selectedNode}
      />
    </div>
  );
}