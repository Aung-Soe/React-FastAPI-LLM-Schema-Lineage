from fastapi import APIRouter
from app.models.chat import ChatRequest, ChatResponse
from app.services.chat_services import handle_chat
from app.infrastructure.lineage_repository import LineageRepository
from app.services.lineage_read_service import LineageReadService
from app.core.logging import get_logger

logger = get_logger("chat")
router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/query", response_model=ChatResponse)
async def chat(req: ChatRequest):
    logger.info("Incoming chat request")
    logger.info(f"Lineage version: {req.lineage_version}")

    if req.selected_node:
        logger.info(
            f"Selected node: {req.selected_node.type} {req.selected_node.name}"
        )
    repo = LineageRepository()
    version = str(req.lineage_version)
    lineage_context = LineageReadService(repo).get_latest_lineage(version=version)
    selected_node = req.selected_node.type + ":" + req.selected_node.name if req.selected_node else None


    reply = await handle_chat(
        req.messages,
        lineage_context=lineage_context,
        selected_node=selected_node
    )
    logger.info("Chat response generated")
    return ChatResponse(reply=reply)