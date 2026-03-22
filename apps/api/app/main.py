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


@app.get("/test-tts")
async def test_tts():
    """Test TTS pipeline step by step."""
    import os, httpx
    results: dict = {
        "elevenlabs_key": os.environ.get("ELEVENLABS_API_KEY", "")[:10] + "...",
        "supabase_jwt": os.environ.get("SUPABASE_JWT_KEY", "")[:20] + "...",
        "supabase_url": os.environ.get("SUPABASE_URL", ""),
    }

    # Step 1: Test ElevenLabs
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(
                "https://api.elevenlabs.io/v1/text-to-speech/CwhRBWXzGAHq8TQ4Fs17/stream",
                headers={"xi-api-key": os.environ.get("ELEVENLABS_API_KEY", ""), "Content-Type": "application/json"},
                params={"output_format": "mp3_44100_128", "optimize_streaming_latency": "3"},
                json={"text": "Prueba de audio.", "model_id": "eleven_multilingual_v2", "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}},
            )
            results["elevenlabs_status"] = resp.status_code
            if resp.status_code == 200:
                audio = resp.content
                results["audio_size"] = f"{len(audio)//1000}KB"
            else:
                results["elevenlabs_error"] = resp.text[:200]
                return results
    except Exception as e:
        results["elevenlabs_error"] = str(e)
        return results

    # Step 2: Test Supabase Storage upload
    try:
        jwt = os.environ.get("SUPABASE_JWT_KEY", "")
        supa_url = os.environ.get("SUPABASE_URL", "")
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp2 = await client.post(
                f"{supa_url}/storage/v1/object/audio/test/test.mp3",
                headers={"Authorization": f"Bearer {jwt}", "Content-Type": "audio/mpeg", "x-upsert": "true"},
                content=audio,
            )
            results["storage_status"] = resp2.status_code
            if resp2.status_code in (200, 201):
                results["audio_url"] = f"{supa_url}/storage/v1/object/public/audio/test/test.mp3"
            else:
                results["storage_error"] = resp2.text[:300]
    except Exception as e:
        results["storage_error"] = str(e)

    return results


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
        "hf_token": "yes" if os.environ.get("HF_TOKEN") else "no",
    }
