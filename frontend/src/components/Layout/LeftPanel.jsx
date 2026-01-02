import ChatBox from "../Chat/ChatBox";
import { theme } from "../../theme/theme";
import { useMemo } from "react";

export default function LeftPanel({
  version,
  onVersionChange,
  selectedNode,
  chatActive,
  setChatActive          // ✅ controlled from parent
}) {

  const dynamicStyles = useMemo(
    () => ({
      chatArea: {
        flex: chatActive ? 1 : 0.66,
        transition: "flex 250ms ease",
        overflow: "hidden",
      },
    }),
    [chatActive]
  );

  return (
    <div style={styles.container}>
      {/* Top section */}
      <div style={styles.versionSelector}>
        <label style={styles.label}>Lineage Version</label>
        <select
          value={version}
          onChange={(e) => onVersionChange(e.target.value)}
          style={styles.select}
        >
          <option value="latest">Latest</option>
          <option value="L2">L2</option>
          <option value="L1">L1</option>
        </select>
      </div>

      {/* Chat section */}
      <div style={{
          ...styles.chatArea,
          flex: chatActive ? 1 : 2,
        }}
      >
        <ChatBox selectedNode={selectedNode}
          chatActive={chatActive}
          setChatActive={setChatActive}
          version={version}
         />
      </div>
    </div>
  );
}

/* ---------- static styles only ---------- */

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(12px)",
    borderRight: "1px solid #e5e7eb",
    fontFamily: theme.typography?.fontFamily || "Inter, system-ui, sans-serif"
  },

  versionSelector: {
    padding: theme.spacing.md,
    borderBottom: "1px solid #e5e7eb",
    background: "linear-gradient(180deg, #f8fafc, #eef2ff)",
  },

  label: {
    fontSize: 12,
    fontWeight: 600,
    color: theme.colors.muted,
    marginBottom: 6,
    display: "block",
  },

  select: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 13,
    outline: "none",
    background: "#fff",
  },

  chatArea: {
    display: "flex",
    flexDirection: "column",
    transition: "flex 250ms ease",
    overflow: "hidden",
  },
};
