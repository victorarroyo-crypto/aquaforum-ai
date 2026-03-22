"""ElevenLabs TTS — production quality, works in any context (sync/async/background)."""

import logging
import os
import re
import uuid

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

ELEVENLABS_API = "https://api.elevenlabs.io/v1"

VOICE_MAP = {
    "Elena Vásquez": "EXAVITQu4vr4xnSDxMaL",
    "Marcus Chen": "onwK4e9ZLuTAKqWW03F9",
    "Sofia Andersen": "Xb7hH8MSUJpSbSDYk0k2",
    "Ahmed Al-Rashid": "JBFqnCBsd6RMkjVDRZzb",
    "Dr. Ingrid Hoffmann": "XrExE9yKIg1WjnnlVkGX",
    "James Okafor": "nPczCjzI2devNBz1zQrb",
    "Moderador": "CwhRBWXzGAHq8TQ4Fs17",
    "Integrador": "cjVigY5qzO86Huf0OWal",
}

DEFAULT_VOICE = "CwhRBWXzGAHq8TQ4Fs17"


def _get_el_key() -> str:
    return settings.elevenlabs_api_key or os.environ.get("ELEVENLABS_API_KEY", "")


def _get_supabase_jwt() -> str:
    for key_name in ["SUPABASE_JWT_KEY", "SUPABASE_SERVICE_ROLE_KEY"]:
        val = os.environ.get(key_name, "")
        if val.startswith("eyJ"):
            return val
    if settings.supabase_service_role_key.startswith("eyJ"):
        return settings.supabase_service_role_key
    return ""


def _clean_text(text: str) -> str:
    """Remove markdown and labels from text for TTS."""
    clean = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    clean = re.sub(r"\[CHALLENGE:[^\]]+\]", "", clean)
    clean = re.sub(r"#{1,3}\s", "", clean)
    clean = re.sub(
        r"^(DECLARACIÓN|APOYO|INTERPELACIÓN|RESPUESTA)\s*",
        "",
        clean,
        flags=re.IGNORECASE,
    )
    return clean.strip()


def generate_speech_sync(text: str, agent_name: str, session_id: str) -> str | None:
    """Generate speech SYNCHRONOUSLY — works in any context including BackgroundTasks."""
    api_key = _get_el_key()
    if not api_key:
        return None

    voice_id = VOICE_MAP.get(agent_name, DEFAULT_VOICE)
    clean = _clean_text(text)
    if len(clean) < 5:
        return None

    try:
        # 1. Generate audio from ElevenLabs (sync)
        with httpx.Client(timeout=45.0) as client:
            resp = client.post(
                f"{ELEVENLABS_API}/text-to-speech/{voice_id}/stream",
                headers={"xi-api-key": api_key, "Content-Type": "application/json"},
                params={"output_format": "mp3_44100_128", "optimize_streaming_latency": "3"},
                json={
                    "text": clean,
                    "model_id": "eleven_multilingual_v2",
                    "voice_settings": {"stability": 0.35, "similarity_boost": 0.8, "style": 0.45, "use_speaker_boost": True},
                },
            )
            if resp.status_code != 200:
                logger.error(f"ElevenLabs error {resp.status_code}: {resp.text[:200]}")
                return None
            audio_bytes = resp.content

        if len(audio_bytes) < 100:
            return None

        logger.info(f"TTS: {len(audio_bytes)//1000}KB for {agent_name}")

        # 2. Upload to Supabase Storage (sync)
        return _upload_sync(audio_bytes, session_id)

    except Exception as e:
        logger.error(f"TTS error for {agent_name}: {e}")
        return None


async def generate_speech(text: str, agent_name: str, session_id: str) -> str | None:
    """Async wrapper — runs sync TTS in a thread to avoid event loop issues."""
    import asyncio
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, generate_speech_sync, text, agent_name, session_id)


def _upload_sync(audio_bytes: bytes, session_id: str) -> str | None:
    """Upload MP3 to Supabase Storage synchronously."""
    supa_url = settings.supabase_url or os.environ.get("SUPABASE_URL", "")
    supa_key = _get_supabase_jwt()
    if not supa_url or not supa_key:
        logger.error("TTS: Missing Supabase credentials for storage")
        return None

    fname = f"{session_id}/{uuid.uuid4().hex[:8]}.mp3"
    url = f"{supa_url}/storage/v1/object/audio/{fname}"
    headers = {"Authorization": f"Bearer {supa_key}", "Content-Type": "audio/mpeg", "x-upsert": "true"}

    with httpx.Client(timeout=15.0) as client:
        r = client.post(url, headers=headers, content=audio_bytes)
        if r.status_code in (200, 201):
            return f"{supa_url}/storage/v1/object/public/audio/{fname}"

        # Create bucket if missing
        if r.status_code in (404, 400):
            client.post(
                f"{supa_url}/storage/v1/bucket",
                headers={"Authorization": f"Bearer {supa_key}", "Content-Type": "application/json"},
                json={"id": "audio", "name": "audio", "public": True},
            )
            r2 = client.post(url, headers=headers, content=audio_bytes)
            if r2.status_code in (200, 201):
                return f"{supa_url}/storage/v1/object/public/audio/{fname}"

        logger.error(f"Storage upload failed: {r.status_code}")
        return None
