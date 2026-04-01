from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import forum

app = FastAPI(
    title="AquaForum AI API",
    description="Multi-agent forum engine — TEXT ONLY (no avatars)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forum.router, prefix="/forum", tags=["forum"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "aquaforum-api"}


@app.get("/debug-tts")
async def debug_tts():
    """Temporary: debug why TTS fails."""
    import os
    import httpx

    result = {}

    el_key = os.environ.get("ELEVENLABS_API_KEY", "")
    jwt = os.environ.get("SUPABASE_JWT_KEY", "")
    supa_url = os.environ.get("SUPABASE_URL", "")

    result["el_key"] = el_key[:10] + "..." if el_key else "MISSING"
    result["jwt"] = jwt[:15] + "..." if jwt else "MISSING"
    result["supa_url"] = supa_url or "MISSING"

    # Test ElevenLabs
    try:
        with httpx.Client(timeout=20.0) as client:
            resp = client.post(
                "https://api.elevenlabs.io/v1/text-to-speech/CwhRBWXzGAHq8TQ4Fs17/stream",
                headers={"xi-api-key": el_key, "Content-Type": "application/json"},
                params={"output_format": "mp3_44100_128"},
                json={"text": "Prueba.", "model_id": "eleven_multilingual_v2", "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}},
            )
            result["el_status"] = resp.status_code
            if resp.status_code == 200:
                result["el_audio_size"] = f"{len(resp.content)}B"
            else:
                result["el_error"] = resp.text[:200]
    except Exception as e:
        result["el_exception"] = str(e)

    # Test Supabase Storage
    if result.get("el_status") == 200:
        try:
            with httpx.Client(timeout=10.0) as client:
                resp2 = client.post(
                    f"{supa_url}/storage/v1/object/audio/debug/test.mp3",
                    headers={"Authorization": f"Bearer {jwt}", "Content-Type": "audio/mpeg", "x-upsert": "true"},
                    content=resp.content,
                )
                result["storage_status"] = resp2.status_code
                if resp2.status_code not in (200, 201):
                    result["storage_error"] = resp2.text[:200]
                else:
                    result["audio_url"] = f"{supa_url}/storage/v1/object/public/audio/debug/test.mp3"
        except Exception as e:
            result["storage_exception"] = str(e)

    return result
