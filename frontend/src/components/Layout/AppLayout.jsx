import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";

export default function AppLayout({ children }) {
  return (
    <div className="app-container">
      <LeftPanel />
      <main className="main-content">{children}</main>
      <RightPanel />
    </div>
  );
}
