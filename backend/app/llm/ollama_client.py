# app/llm/ollama_client.py
import httpx
from typing import List, Dict

OLLAMA_URL = "http://ollama-gemma:11434"  # or env var
MODEL_NAME = "gemma3:1b"

async def chat_with_ollama(messages: List[Dict[str, str]]) -> str:
    payload = {
        "model": MODEL_NAME,
        "messages": [
            m.model_dump() if hasattr(m, "model_dump") else m for m in messages
        ],
        "stream": False,
    }

    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(
            f"{OLLAMA_URL}/api/chat",
            json=payload,
        )
        resp.raise_for_status()
        data = resp.json()

    return data["message"]["content"]