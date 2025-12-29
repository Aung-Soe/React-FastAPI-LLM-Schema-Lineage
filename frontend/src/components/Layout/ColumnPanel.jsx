export default function ColumnPanel({ lineage, selectedNode }) {
  if (!selectedNode) {
    return (
      <div style={panelStyle}>
        <h3>No selection</h3>
        <p>Select a table or view to see columns.</p>
      </div>
    );
  }

  if (selectedNode.type !== "table" && selectedNode.type !== "view") {
    return (
      <div style={panelStyle}>
        <h3>{selectedNode.name}</h3>
        <p>No columns available.</p>
      </div>
    );
  }

  const columns = lineage.nodes.filter(
    n =>
      n.type === "column" &&
      n.name.startsWith(`${selectedNode.name}.`)
  );

  return (
    <div style={panelStyle}>
      <h3>
        {selectedNode.name}
        <span style={{ fontSize: 12, color: "#666" }}>
          {" "}({selectedNode.type})
        </span>
      </h3>

      {columns.length === 0 ? (
        <p>No columns found.</p>
      ) : (
        <ul style={{ paddingLeft: 16 }}>
          {columns.map(col => (
            <li key={col.name}>{col.name.split(".")[1]}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

const panelStyle = {
  width: 300,
  borderLeft: "1px solid #ddd",
  padding: 16,
  background: "#fafafa",
  overflowY: "auto",
};
