import TopBar from "./TopBar";
import LeftPanel from "./LeftPanel";
import ColumnPanel from "./ColumnPanel";
import { colors } from "../../theme";

export default function AppLayout({ children, left, right }) {
  return (
    <div style={{ height: "100vh", background: colors.background }}>
      <TopBar />

      <div style={{ display: "flex", height: "calc(100vh - 56px)" }}>
        {left}
        <div style={{ flex: 1 }}>{children}</div>
        {right}
      </div>
    </div>
  );
}