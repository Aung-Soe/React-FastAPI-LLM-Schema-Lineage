import { useEffect, useRef, useState } from "react";
import { theme } from "../../theme";

export default function ChatBox({ selectedNode }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Ask me about schema lineage, views, or relationships.",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  /* ---------- auto scroll ---------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------- submit ---------- */
  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const contextHint = selectedNode
      ? ` (context: ${selectedNode.type} ${selectedNode.name})`
      : "";

    setMessages((prev) => [
      ...prev,
      { role: "user", content: input },
      {
        role: "assistant",
        content: `Understood${contextHint}. (LLM response placeholder)`,
      },
    ]);

    setInput("");
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
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={styles.inputBar}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this schema…"
          style={styles.input}
        />
        <button style={styles.button}>Send</button>
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
    background: theme.colors.panel,
    backdropFilter: "blur(12px)",
    borderRadius: 12,
    border: `1px solid ${theme.colors.border}`,
    fontFamily: theme.typography.fontFamily,
    overflow: "hidden",
  },

  header: {
    padding: "10px 14px",
    fontWeight: 600,
    fontSize: theme.typography.heading,
    background: "linear-gradient(90deg, #f8fafc, #eef2ff)",
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
    padding: theme.spacing.md,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing.sm,
  },

  message: {
    padding: "8px 12px",
    borderRadius: 10,
    fontSize: theme.typography.body,
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
    color: theme.colors.text,
  },

  inputBar: {
    display: "flex",
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderTop: `1px solid ${theme.colors.border}`,
    background: "#ffffffcc",
  },

  input: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: theme.typography.body,
  },

  button: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "none",
    background: theme.colors.primary,
    color: "white",
    fontSize: theme.typography.body,
    fontWeight: 500,
    cursor: "pointer",
  },
};