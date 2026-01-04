from app.llm.ollama_client import chat_with_ollama


async def handle_chat(messages, lineage_context):

    prompt = (
            "You are a schema lineage expert.\n"
            "You analyze tables, views, and relationships.\n"
            "Provide concise, accurate answers based on the provided context.\n"
            "If you don't know the answer, say 'I don't know'.\n"
            "Keep answer maximum 5 lines.'\n"
        )

    system_prompt = {
        "role": "system",
        "content": f"{prompt}.\n{lineage_context}",
    }

    full_messages = [system_prompt] + messages

    reply = await chat_with_ollama(full_messages)
    return reply