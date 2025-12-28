const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const fetchLatestLineage = async () => {
  const res = await fetch(`${API_BASE}/lineage/latest`);
  return res.json();
};