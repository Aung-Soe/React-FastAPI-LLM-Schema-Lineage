import { useEffect, useState } from "react";
import LineageGraph from "@/components/Graph/LineageGraph";

export default function App() {
  const [lineage, setLineage] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/lineage/latest")
      .then((res) => res.json())
      .then(setLineage)
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Schema Lineage UI</h1>

      {!lineage && <p>Loading lineage…</p>}

      {lineage && <LineageGraph lineage={lineage} />}
    </div>
  );
}
