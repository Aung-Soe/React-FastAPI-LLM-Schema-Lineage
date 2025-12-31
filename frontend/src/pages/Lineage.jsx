import { useEffect, useState } from "react";
import LineageGraph from "../components/Graph/LineageGraph";
import ColumnPanel from "../components/Layout/ColumnPanel";
import LeftPanel from "../components/Layout/LeftPanel";

const API_URL = import.meta.env.VITE_API_URL;

export default function Lineage() {
  const [version, setVersion] = useState("latest");
  const [lineage, setLineage] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLineage() {
      setLoading(true);
      setError(null);
      setSelectedNode(null);

      try {
        const res = await fetch(
          `${API_URL}/api/v1/lineage/${version}`
        );

        const data = await res.json();

        if (!res.ok || data?.detail) {
          throw new Error(data?.detail || "Failed to load lineage");
        }

        if (!cancelled) {
          setLineage(data);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError(err.message);
          setLineage(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadLineage();

    return () => {
      cancelled = true;
    };
  }, [version]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left panel */}
      <LeftPanel
        version={version}
        onVersionChange={setVersion}
      />

      {/* Main graph */}
      <div style={{ flex: 1, position: "relative" }}>
        {loading && (
          <div style={{ padding: 20 }}>Loading lineage…</div>
        )}

        {error && (
          <div style={{ padding: 20, color: "red" }}>
            {error}
          </div>
        )}

        {!loading && lineage && (
          <LineageGraph
            key={version}   // 👈 IMPORTANT FIX
            lineage={lineage}
            onNodeSelect={setSelectedNode}
          />
        )}
      </div>

      {/* Right panel */}
      <ColumnPanel
        lineage={lineage}
        selectedNode={selectedNode}
      />
    </div>
  );
}
