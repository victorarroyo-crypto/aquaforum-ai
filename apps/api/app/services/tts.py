"""Edge TTS — Microsoft Neural voices, FREE, native Spanish, high quality."""

import logging
import os
import re
import uuid
import asyncio
import tempfile

from app.config import settings

logger = logging.getLogger(__name__)

# Native Spanish voices — gender-matched to panelists
VOICE_MAP = {
    # Female panelists → female Spanish voices
    "Elena Vásquez": "es-ES-XimenaNeural",
    "Sofia Andersen": "es-CO-SalomeNeural",
    "Dr. Ingrid Hoffmann": "es-CL-CatalinaNeural",
    # Male panelists → male Spanish voices
    "Marcus Chen": "es-MX-JorgeNeural",
    "Ahmed Al-Rashid": "es-AR-TomasNeural",
    "James Okafor": "es-BO-MarceloNeural",
    "Koji Tanaka": "es-ES-AlvaroNeural",
    # System agents
    "Moderador": "es-ES-AlvaroNeural",
    "Integrador": "es-MX-JorgeNeural",
}

DEFAULT_VOICE = "es-ES-AlvaroNeural"


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
    # Remove markdown bullet points
    clean = re.sub(r"^[-*]\s+", "", clean, flags=re.MULTILINE)
    return clean.strip()


def _get_supabase_jwt() -> str:
    for key_name in ["SUPABASE_JWT_KEY", "SUPABASE_SERVICE_ROLE_KEY"]:
        val = os.environ.get(key_name, "")
        if val.startswith("eyJ"):
            return val
    if settings.supabase_service_role_key.startswith("eyJ"):
        return settings.supabase_service_role_key
    return ""


async def generate_speech(text: str, agent_name: str, session_id: str) -> str | None:
    """Generate speech with Edge TTS — native Spanish, FREE."""
    import edge_tts

    voice = VOICE_MAP.get(agent_name, DEFAULT_VOICE)
    clean = _clean_text(text)
    if len(clean) < 5:
        return None

    try:
        # Generate audio with edge-tts
        communicate = edge_tts.Communicate(clean, voice, rate="-5%")

        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
            tmp_path = tmp.name

        await communicate.save(tmp_path)

        with open(tmp_path, "rb") as f:
            audio_bytes = f.read()

        os.unlink(tmp_path)

        if len(audio_bytes) < 100:
            return None

        logger.info(f"TTS: {len(audio_bytes)//1000}KB for {agent_name} ({voice})")

        # Upload to Supabase Storage
        return _upload_sync(audio_bytes, session_id)

    except Exception as e:
        logger.error(f"TTS error for {agent_name}: {e}")
        return None


def generate_speech_sync(text: str, agent_name: str, session_id: str) -> str | None:
    """Sync wrapper for contexts that can't use async."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # Already in async context, create a new task
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                result = pool.submit(
                    asyncio.run,
                    generate_speech(text, agent_name, session_id)
                ).result(timeout=60)
            return result
        else:
            return loop.run_until_complete(
                generate_speech(text, agent_name, session_id)
            )
    except Exception as e:
        logger.error(f"TTS sync error: {e}")
        return None


def _upload_sync(audio_bytes: bytes, session_id: str) -> str | None:
    """Upload MP3 to Supabase Storage synchronously."""
    import httpx

    supa_url = os.environ.get("SUPABASE_URL", "") or settings.supabase_url
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
