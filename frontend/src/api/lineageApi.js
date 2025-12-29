const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export async function fetchLatestLineage() {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/lineage/latest`
  );
  if (!res.ok) throw new Error("Failed to fetch lineage");
  return res.json();
}