"""ElevenLabs TTS — paid plan, production quality.

Each panelist has a unique voice. Audio uploaded to Supabase Storage."""

import httpx
import os
import re
import uuid
from app.config import settings

ELEVENLABS_API = "https://api.elevenlabs.io/v1"

VOICE_MAP = {
    "Elena Vásquez":       "EXAVITQu4vr4xnSDxMaL",   # Sarah
    "Marcus Chen":         "onwK4e9ZLuTAKqWW03F9",    # Daniel
    "Sofia Andersen":      "Xb7hH8MSUJpSbSDYk0k2",    # Alice
    "Ahmed Al-Rashid":     "JBFqnCBsd6RMkjVDRZzb",    # George
    "Dr. Ingrid Hoffmann": "XrExE9yKIg1WjnnlVkGX",    # Matilda
    "James Okafor":        "nPczCjzI2devNBz1zQrb",    # Brian
    "Moderador":           "CwhRBWXzGAHq8TQ4Fs17",    # Roger
    "Integrador":          "cjVigY5qzO86Huf0OWal",    # Eric
}

DEFAULT_VOICE = "CwhRBWXzGAHq8TQ4Fs17"


def _get_el_key() -> str:
    return settings.elevenlabs_api_key or os.environ.get("ELEVENLABS_API_KEY", "")


def _get_supabase_jwt() -> str:
    jwt = os.environ.get("SUPABASE_JWT_KEY", "")
    if jwt:
        return jwt
    srk = settings.supabase_service_role_key or os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    return srk if srk.startswith("eyJ") else ""


async def generate_speech(text: str, agent_name: str, session_id: str) -> str | None:
    """Generate speech via ElevenLabs, upload to Supabase Storage, return public URL."""
    api_key = _get_el_key()
    if not api_key:
        return None

    voice_id = VOICE_MAP.get(agent_name, DEFAULT_VOICE)

    # Clean text
    clean = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    clean = re.sub(r'\[CHALLENGE:[^\]]+\]', '', clean)
    clean = re.sub(r'#{1,3}\s', '', clean)
    clean = re.sub(r'^(DECLARACIÓN|APOYO|INTERPELACIÓN|RESPUESTA)\s*', '', clean, flags=re.IGNORECASE)
    clean = clean.strip()

    if len(clean) < 5:
        return None

    try:
        # Generate audio — stream for lower latency
        audio_chunks: list[bytes] = []
        async with httpx.AsyncClient(timeout=45.0) as client:
            async with client.stream(
                "POST",
                f"{ELEVENLABS_API}/text-to-speech/{voice_id}/stream",
                headers={"xi-api-key": api_key, "Content-Type": "application/json"},
                params={"output_format": "mp3_44100_128", "optimize_streaming_latency": "3"},
                json={
                    "text": clean,
                    "model_id": "eleven_multilingual_v2",
                    "voice_settings": {"stability": 0.35, "similarity_boost": 0.8, "style": 0.45, "use_speaker_boost": True},
                },
            ) as resp:
                if resp.status_code != 200:
                    body = await resp.aread()
                    print(f"TTS ElevenLabs error {resp.status_code}: {body[:200]}")
                    return None
                async for chunk in resp.aiter_bytes(4096):
                    audio_chunks.append(chunk)

        audio_bytes = b"".join(audio_chunks)
        if len(audio_bytes) < 100:
            return None

        print(f"TTS: {len(audio_bytes)//1000}KB for {agent_name}")

        # Upload to Supabase Storage
        return await _upload(audio_bytes, session_id)

    except Exception as e:
        print(f"TTS error: {e}")
        return None


async def _upload(audio_bytes: bytes, session_id: str) -> str | None:
    supa_url = settings.supabase_url or os.environ.get("SUPABASE_URL", "")
    supa_key = _get_supabase_jwt()
    if not supa_url or not supa_key:
        return None

    fname = f"{session_id}/{uuid.uuid4().hex[:8]}.mp3"
    url = f"{supa_url}/storage/v1/object/audio/{fname}"
    hdrs = {"Authorization": f"Bearer {supa_key}", "Content-Type": "audio/mpeg", "x-upsert": "true"}

    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.post(url, headers=hdrs, content=audio_bytes)
        if r.status_code in (200, 201):
            return f"{supa_url}/storage/v1/object/public/audio/{fname}"

        # Create bucket if missing
        if r.status_code in (404, 400):
            await client.post(
                f"{supa_url}/storage/v1/bucket",
                headers={"Authorization": f"Bearer {supa_key}", "Content-Type": "application/json"},
                json={"id": "audio", "name": "audio", "public": True},
            )
            r2 = await client.post(url, headers=hdrs, content=audio_bytes)
            if r2.status_code in (200, 201):
                return f"{supa_url}/storage/v1/object/public/audio/{fname}"

        print(f"Storage error: {r.status_code}")
        return None
