from fastapi import APIRouter
from app.models.chat import ChatRequest, ChatResponse
from app.services.chat_services import handle_chat

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/query", response_model=ChatResponse)
async def chat(req: ChatRequest):
    reply = await handle_chat(
        req.messages,
        lineage_context=...
    )
    return ChatResponse(reply=reply)