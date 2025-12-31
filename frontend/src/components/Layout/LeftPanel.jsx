import { useState } from "react";

const VERSIONS = ["latest", "L2", "L1"];

export default function LeftPanel({ selectedVersion, onVersionChange }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      style={{
        width: collapsed ? 40 : 260,
        transition: "width 0.25s ease",
        borderRight: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        background: "#f9fafb",
      }}
    >
      {/* Collapse toggle */}
      <div
        style={{
          padding: 8,
          borderBottom: "1px solid #e5e7eb",
          cursor: "pointer",
          textAlign: "center",
          fontWeight: 600,
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? "»" : "«"}
      </div>

      {!collapsed && (
        <>
          {/* ───────── Top section (version selector) ───────── */}
          <div style={{ padding: 12 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#374151",
              }}
            >
              Lineage Version
            </label>

            <select
              value={selectedVersion}
              onChange={(e) => onVersionChange(e.target.value)}
              style={{
                marginTop: 6,
                width: "100%",
                padding: 6,
                borderRadius: 6,
                border: "1px solid #d1d5db",
                background: "#fff",
              }}
            >
              {VERSIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* ───────── Bottom section (LLM Chat placeholder) ───────── */}
          <div
            style={{
              flex: 1,
              borderTop: "1px solid #e5e7eb",
              padding: 12,
              color: "#6b7280",
              fontSize: 13,
            }}
          >
            <strong>Schema Assistant</strong>
            <p style={{ marginTop: 8 }}>
              💬 LLM-powered lineage explanations will appear here.
            </p>
          </div>
        </>
      )}
    </div>
  );
}