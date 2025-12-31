import { colors, shadows, spacing } from "../../theme";

export default function TopBar() {
  return (
    <div
      style={{
        height: 56,
        display: "flex",
        alignItems: "center",
        padding: `0 ${spacing.lg}px`,
        background: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        boxShadow: shadows.sm,
        fontWeight: 600,
        fontSize: 18,
        color: colors.textPrimary,
      }}
    >
      🧬 Schema Lineage Explorer
    </div>
  );
}