from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router
import os
import fasttext

# ==============================
# 🔐 Load Environment Variables
# ==============================
from .config import GROQ_API_KEY, MODEL_NAME

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is not set")

# ==============================
# 🌍 FastAPI App Init
# ==============================
app = FastAPI()

# ==============================
# 🌐 CORS CONFIG (CRITICAL)
# ==============================
origins = [
    "https://crossfirechat-1.onrender.com",  # Production frontend
    "http://localhost:5173",                 # Local dev (Vite)
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ==============================
# 🤖 Load FastText Model Safely
# ==============================
MODEL_PATH = os.path.join(os.path.dirname(__file__), "fasttext/lid.176.ftz")

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"FastText model not found at {MODEL_PATH}")

ft_model = fasttext.load_model(MODEL_PATH)

# Make model accessible in routes
app.state.ft_model = ft_model

# ==============================
# 📡 Register API Routes
# ==============================
app.include_router(router)

# ==============================
# 🚀 Local Development Entry
# ==============================
if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 5000))

    uvicorn.run(
        "backend.app:app",
        host="0.0.0.0",
        port=port,
        reload=True,
    )
