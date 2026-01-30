from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router

app = FastAPI()

# ✅ CORS CONFIG
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://crossfirechat-1.onrender.com"],  # Vite frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include your API routes
app.include_router(router)  # allow requests from your React frontend


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False, port=5000)

