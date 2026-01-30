import os

GROQ_API_KEY = os.getenv("GROQ_API_KEY")  # Will read from Render environment
MODEL_NAME = os.getenv("MODEL_NAME", "llama-3.3-70b-versatile")  # Default if not set


BOOK_PATHS = {
    "eva": [
        "backend/books/Crossfire1.pdf",
        "backend/books/Crossfire2.pdf",
        "backend/books/Crossfire3.pdf",
        "backend/books/Crossfire4.pdf",
        "backend/books/Crossfire5.pdf",
    ],
    "gideon": [
        "backend/books/Crossfire1.pdf",
        "backend/books/Crossfire2.pdf",
        "backend/books/Crossfire3.pdf",
        "backend/books/Crossfire4.pdf",
        "backend/books/Crossfire5.pdf",
    ],
}

CHUNK_SIZE = 1200  # characters per chunk
TOP_K_CHUNKS = 5   # how many chunks we send to Groq per message
MODEL_NAME = "llama-3.3-70b-versatile"  # example Groq model