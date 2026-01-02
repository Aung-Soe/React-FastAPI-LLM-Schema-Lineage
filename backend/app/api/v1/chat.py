from fastapi import APIRouter
from app.models.chat import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/query", response_model=ChatResponse)
def chat(req: ChatRequest):
    context = ""

    if req.selected_node:
        context = (
            "Context:\n"
            f"- Type: {req.selected_node.type}\n"
            f"- Name: {req.selected_node.name}\n"
        )

    return ChatResponse(
        reply=(
            "This is a stubbed response.\n\n"
            f"{context}\n"
            f"Lineage version: {req.lineage_version}\n\n"
            f"User asked: {req.messages[-1].content}"
        )
    )
