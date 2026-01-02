import { theme } from "../theme/theme";

export const panelContainer = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  background: theme.colors.bgPanel,
  borderRight: `1px solid ${theme.colors.border}`,
};

export const panelSection = {
  padding: theme.spacing.md,
  borderBottom: `1px solid ${theme.colors.border}`,
};

export const chatContainer = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  background: theme.colors.bgSoft,
};

export const chatHistory = {
  flex: 1,
  overflowY: "auto",
  padding: theme.spacing.md,
  color: theme.colors.textPrimary,
};

export const chatInputContainer = {
  borderTop: `1px solid ${theme.colors.border}`,
  padding: theme.spacing.sm,
  background: theme.colors.bgPanel,
};
