from pydantic import BaseModel, Field
from typing import List, Optional, Literal


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system", "tool"]
    content: str


class SelectedNode(BaseModel):
    type: str
    name: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    lineage_version: str = Field(..., example="latest")
    selected_node: Optional[SelectedNode] = None


class ChatResponse(BaseModel):
    reply: str
