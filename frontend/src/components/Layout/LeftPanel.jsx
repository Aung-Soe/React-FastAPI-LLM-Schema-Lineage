import { theme } from "../../theme";
import ChatBox from "../Chat/ChatBox";

export default function LeftPanel({
  version,
  onVersionChange,
  selectedNode,
}) {
  return (
    <div style={styles.container}>
      {/* Top 1/3 — Version Selector */}
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

      {/* Bottom 2/3 — Chat */}
      <div style={styles.chatArea}>
        <ChatBox selectedNode={selectedNode} 
        version={version}
        />
      </div>
    </div>
  );
}

/* ✅ styles defined and theme-backed */
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: theme.colors.backgroundGlass,
    backdropFilter: "blur(12px)",
    borderRadius: 12,
    border: `1px solid ${theme.colors.panelBorder}`,
    boxShadow: theme.shadows.panel,
    overflow: "hidden",
    fontFamily: theme.typography.fontFamily,
  },

  versionSelector: {
    padding: theme.spacing.md,
    borderBottom: `1px solid ${theme.colors.panelBorder}`,
    background: theme.colors.primarySoft,
  },

  label: {
    fontSize: 12,
    fontWeight: 600,
    color: theme.colors.textSecondary,
    marginBottom: 6,
    display: "block",
  },

  select: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 8,
    border: `1px solid ${theme.colors.panelBorder}`,
    fontSize: 13,
    outline: "none",
  },

  chatArea: {
    flex: 1,
    overflow: "hidden",
  },
};
