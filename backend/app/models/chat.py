from pydantic import BaseModel
from typing import List, Optional, Literal


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class SelectedNode(BaseModel):
    type: str
    name: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    lineage_version: str
    selected_node: Optional[SelectedNode] = None


class ChatResponse(BaseModel):
    reply: str
