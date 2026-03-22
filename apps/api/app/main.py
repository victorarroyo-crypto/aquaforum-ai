from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import forum

app = FastAPI(
    title="AquaForum AI API",
    description="Multi-agent forum engine for the water industry",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forum.router, prefix="/forum", tags=["forum"])


@app.get("/health")
async def health():
    import os
    env_key = os.environ.get("ELEVENLABS_API_KEY", "")
    return {
        "status": "ok",
        "service": "aquaforum-api",
        "tts_settings": "yes" if settings.elevenlabs_api_key else "no",
        "tts_env": "yes" if env_key else "no",
        "tts_env_prefix": env_key[:8] + "..." if env_key else "empty",
    }
