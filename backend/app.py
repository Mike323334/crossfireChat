# backend/app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router
import os
import fasttext

# ✅ Load environment variables from config
from .config import GROQ_API_KEY, MODEL_NAME  # Make sure GROQ_API_KEY is set in Render env vars

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is not set")

# ✅ Load FastText model safely
MODEL_PATH = os.path.join(os.path.dirname(__file__), "fasttext/lid.176.ftz")
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"FastText model not found at {MODEL_PATH}")

ft_model = fasttext.load_model(MODEL_PATH)

# ✅ Initialize FastAPI app
app = FastAPI()

# ✅ CORS CONFIG
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://crossfirechat-1.onrender.com"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include API routes
app.include_router(router)

# ✅ Run app locally with Uvicorn
if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 5000))  # Default 5000 for local dev
    uvicorn.run(
        "backend.app:app",  # points to FastAPI app object
        host="0.0.0.0",
        port=port,
        reload=True  # auto-reload for local development
    )
