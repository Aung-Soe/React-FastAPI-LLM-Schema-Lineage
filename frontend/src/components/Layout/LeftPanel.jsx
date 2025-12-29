import ChatPlaceholder from "../chat/ChatPlaceholder";

export default function LeftPanel() {
  return (
    <aside className="left-panel">
      <h3>Lineage Version</h3>

      <select disabled>
        <option>Latest</option>
      </select>

      <hr />

      <ChatPlaceholder />
    </aside>
  );
}
