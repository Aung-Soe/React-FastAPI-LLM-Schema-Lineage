import { theme } from "../../theme/theme";

export default function TopBar() {
  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <div style={styles.title}>
          Schema Lineage Explorer
        </div>
        <div style={styles.subtitle}>
          Tables · Views · Column Dependencies
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: 64,
    display: "flex",
    alignItems: "center",
    padding: "0 24px",
    background: theme.colors.topbarBg,
    borderBottom: `1px solid ${theme.colors.border}`,
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    zIndex: 100,
  },
  left: {
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: theme.colors.topbarText,
    letterSpacing: "0.3px",
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.topbarSubText,
    marginTop: 2,
  },
};
