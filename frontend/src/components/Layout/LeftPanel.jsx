export default function LeftPanel({ version, onVersionChange }) {
  return (
    <div
      style={{
        width: 260,
        borderRight: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        padding: 12,
      }}
    >
      {/* Top section */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 600 }}>Lineage version</label>
        <select
          value={version}
          onChange={(e) => onVersionChange(e.target.value)}
          style={{
            width: "100%",
            marginTop: 8,
            padding: 6,
          }}
        >
          <option value="latest">Latest</option>
          <option value="L2">L2</option>
          <option value="L1">L1</option>
        </select>
      </div>

      {/* Chat placeholder */}
      <div
        style={{
          flex: 1,
          borderTop: "1px solid #e5e7eb",
          paddingTop: 12,
          color: "#6b7280",
          fontSize: 14,
        }}
      >
        💬 Chat assistant (coming soon)
      </div>
    </div>
  );
}
