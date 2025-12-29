import { useEffect, useState } from "react";
import LineageGraph from "../components/Graph/LineageGraph";

const API_URL = import.meta.env.VITE_API_URL;

export default function Lineage() {
  const [lineage, setLineage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/lineage/latest`)
      .then(res => res.json())
      .then(data => {
        console.log("LINEAGE FROM BACKEND:", data);
        setLineage(data);
      })
      .catch(err => {
        console.error("FAILED TO FETCH LINEAGE", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading lineage...</div>;
  if (!lineage) return <div>No lineage data</div>;

  return <LineageGraph lineage={lineage} />;
}
