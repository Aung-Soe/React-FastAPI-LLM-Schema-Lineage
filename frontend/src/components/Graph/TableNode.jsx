export default function TableNode({ data }) {
  return (
    <div
      style={{
        padding: 10,
        borderRadius: 6,
        border: "1px solid #999",
        background: data.nodeType === "view" ? "#eef6ff" : "#f7f7f7",
        fontWeight: 500,
        cursor: "pointer"
      }}
    >
      {data.label}
      <div style={{ fontSize: 10, opacity: 0.6 }}>
        {data.nodeType.toUpperCase()}
      </div>
    </div>
  );
}