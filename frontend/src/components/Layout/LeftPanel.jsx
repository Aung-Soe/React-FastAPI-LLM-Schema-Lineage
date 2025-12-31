export default function LeftPanel({
  selectedVersion,
  onVersionChange,
}) {
  return (
    <div
      style={{
        width: 260,
        padding: "16px",
        borderRight: "1px solid #e5e7eb",
        background: "#f9fafb",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 14 }}>
        Lineage Version
      </div>

      <select
        value={selectedVersion}
        onChange={(e) => onVersionChange(e.target.value)}
        style={{
          padding: "8px 10px",
          borderRadius: 8,
          border: "1px solid #d1d5db",
          background: "white",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        <option value="latest">Latest</option>
        <option value="L2">L2</option>
        <option value="L1">L1</option>
      </select>

      <div
        style={{
          fontSize: 12,
          color: "#6b7280",
          marginTop: 8,
        }}
      >
        Select which lineage snapshot to visualize.
      </div>
    </div>
  );
}
