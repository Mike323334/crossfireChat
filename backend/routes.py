from fastapi import APIRouter
from .groq_client import query_character

router = APIRouter()

@router.post("/chat/{character}")
async def chat(character: str, body: dict):
    message = body.get("message", "")
    reply = query_character(character, message)
    return {"response": reply}
