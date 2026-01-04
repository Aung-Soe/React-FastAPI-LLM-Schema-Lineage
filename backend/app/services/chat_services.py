from app.llm.ollama_client import chat_with_ollama
from app.core.logging import get_logger

logger = get_logger("chat-llm-handler")

async def handle_chat(messages, lineage_context, selected_node=None):

    prompt = (
            "You are an expert in relational database, SQL, and schema lineage.\n"
            "Read and analyze Table or view: {selected_node} and  Lineage Context: {lineage_context}.\n"
            "Each node has name, type, and edges list.\n"
            "Type shows the node is eiter a table or a view.\n"
            "Edges shows the relationships with other nodes.\n"
            "Answer the question about {selected_node} based on the context above selected node.\n"
            "If you don't know the answer, say 'I don't know'.\n"
            "Keep answer maximum 5 lines.'\n".format(selected_node=selected_node, lineage_context=lineage_context)
    )

    logger.info(f"prompt: {prompt}")
    system_prompt = {
        "role": "system",
        "content": f"{prompt}\n"
    }

    full_messages = [system_prompt] + messages

    reply = await chat_with_ollama(full_messages)
    logger.info(f"LLM reply: {reply}")
    return reply