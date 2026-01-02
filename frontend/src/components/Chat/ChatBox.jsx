import { useEffect, useRef, useState } from "react";
import { sendChatMessage } from "../../api/chatApi";
import { theme } from "../../theme";

export default function ChatBox({ selectedNode, version }) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Ask me about schema lineage, views, or relationships.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  /* ---------- auto scroll ---------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* ---------- submit ---------- */
  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await fetch(
        `${API_URL}/api/v1/chat/query`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            lineage_version: "latest",
            selected_node: selectedNode
              ? {
                  type: selectedNode.type,
                  name: selectedNode.name,
                }
              : null,
          }),
        }
      );

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Backend unavailable",
        },
      ]);
    }
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        Schema Assistant
        {selectedNode && (
          <span style={styles.context}>
            {selectedNode.type}: {selectedNode.name}
          </span>
        )}
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              ...(m.role === "user"
                ? styles.userMessage
                : styles.assistantMessage),
            }}
          >
            {m.content}
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.message, ...styles.assistantMessage }}>
            Thinking…
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={styles.inputBar}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this schema…"
          style={styles.input}
          disabled={loading}
        />
        <button style={styles.button} disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
}

/* ---------- styles ---------- */

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(12px)",
    borderRadius: 12,
    border: `1px solid ${theme.colors.border}`,
    overflow: "hidden",
  },

  header: {
    padding: "10px 14px",
    fontWeight: 600,
    fontSize: 14,
    background: "linear-gradient(90deg,#f8fafc,#eef2ff)",
    borderBottom: `1px solid ${theme.colors.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  context: {
    fontSize: 12,
    color: theme.colors.primary,
    background: "#eef2ff",
    padding: "2px 8px",
    borderRadius: 999,
  },

  messages: {
    flex: 1,
    padding: 12,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  message: {
    padding: "8px 12px",
    borderRadius: 10,
    fontSize: 13,
    lineHeight: 1.4,
    maxWidth: "90%",
  },

  userMessage: {
    alignSelf: "flex-end",
    background: theme.colors.primary,
    color: "white",
  },

  assistantMessage: {
    alignSelf: "flex-start",
    background: "#f1f5f9",
    color: "#111827",
  },

  inputBar: {
    display: "flex",
    gap: 8,
    padding: 10,
    borderTop: `1px solid ${theme.colors.border}`,
    background: "#ffffffcc",
  },

  input: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: 8,
    border: `1px solid ${theme.colors.border}`,
    outline: "none",
    fontSize: 13,
  },

  button: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "none",
    background: theme.colors.primary,
    color: "white",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
};
