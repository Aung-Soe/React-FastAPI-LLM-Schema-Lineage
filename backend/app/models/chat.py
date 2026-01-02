from typing import List, Optional
from pydantic import BaseModel


# ---------- message ----------

class ChatMessage(BaseModel):
    role: str  # "user" | "assistant" | "system"
    content: str


# ---------- context ----------

class SelectedNode(BaseModel):
    type: str  # "table" | "view"
    name: str


# ---------- request ----------

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    lineage_version: str = "latest"
    selected_node: Optional[SelectedNode] = None


# ---------- response ----------

class ChatResponse(BaseModel):
    reply: str