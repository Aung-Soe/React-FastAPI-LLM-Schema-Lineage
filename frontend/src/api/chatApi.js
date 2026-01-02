const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function sendChatMessage({
  question,
  selectedNode,
  version,
}) {
  const res = await fetch(`${API_URL}/api/v1/chat/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      context: selectedNode
        ? {
            type: selectedNode.type,
            name: selectedNode.name,
          }
        : null,
      version,
    }),
  });

  if (!res.ok) {
    throw new Error("Chat request failed");
  }

  return res.json();
}
