"""ElevenLabs Streaming TTS for AquaForum AI.

Uses the /stream endpoint for lower latency.
Uploads to Supabase Storage, returns public URL for instant playback."""

import httpx
import os
import uuid
from app.config import settings

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


def _get_api_key() -> str:
    return settings.elevenlabs_api_key or os.environ.get("ELEVENLABS_API_KEY", "")


def _get_supabase_url() -> str:
    return settings.supabase_url or os.environ.get("SUPABASE_URL", "")


def _get_supabase_key() -> str:
    # Storage API needs the full JWT (eyJ...), not sb_secret_ format
    # Prioritize SUPABASE_JWT_KEY which is always the full JWT
    jwt = os.environ.get("SUPABASE_JWT_KEY", "")
    if jwt:
        return jwt
    # Fallback: use service role key only if it's a JWT
    srk = settings.supabase_service_role_key or os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if srk.startswith("eyJ"):
        return srk
    return ""


async def generate_speech(text: str, agent_name: str, session_id: str) -> str | None:
    """Generate streaming speech, upload to storage, return public URL."""
    api_key = _get_api_key()
    if not api_key:
        return None

    voice_id = VOICE_MAP.get(agent_name, DEFAULT_VOICE)
    speech_text = text[:1500] if len(text) > 1500 else text

    supabase_url = _get_supabase_url()
    supabase_key = _get_supabase_key()
    print(f"TTS: Starting for {agent_name} | EL key: {api_key[:8]}... | Supa URL: {bool(supabase_url)} | Supa JWT: {supabase_key[:15] if supabase_key else 'EMPTY'}...")

    if not supabase_url or not supabase_key:
        print(f"TTS: Missing Supabase credentials, skipping")
        return None

    # Clean text for TTS — remove markdown formatting
    import re
    speech_text = re.sub(r'\*\*([^*]+)\*\*', r'\1', speech_text)  # Remove **bold**
    speech_text = re.sub(r'\[CHALLENGE:[^\]]+\]', '', speech_text)  # Remove challenge tags

    try:
        # 1. Stream audio from ElevenLabs
        audio_chunks: list[bytes] = []
        async with httpx.AsyncClient(timeout=45.0) as client:
            async with client.stream(
                "POST",
                f"{ELEVENLABS_API}/text-to-speech/{voice_id}/stream",
                headers={
                    "xi-api-key": api_key,
                    "Content-Type": "application/json",
                },
                params={
                    "output_format": "mp3_44100_128",
                    "optimize_streaming_latency": "3",
                },
                json={
                    "text": speech_text,
                    "model_id": "eleven_multilingual_v2",
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.75,
                        "style": 0.3,
                    },
                },
            ) as response:
                if response.status_code != 200:
                    error_body = await response.aread()
                    print(f"TTS error {response.status_code}: {error_body[:200]}")
                    return None

                async for chunk in response.aiter_bytes(chunk_size=4096):
                    audio_chunks.append(chunk)

        audio_bytes = b"".join(audio_chunks)
        if len(audio_bytes) < 100:
            print(f"TTS: Audio too small ({len(audio_bytes)} bytes)")
            return None

        print(f"TTS: Streamed {len(audio_bytes)//1000}KB for {agent_name}")

        # 2. Upload to Supabase Storage
        audio_url = await _upload_to_storage(audio_bytes, session_id)
        return audio_url

    except Exception as e:
        print(f"TTS exception: {e}")
        return None


async def _upload_to_storage(audio_bytes: bytes, session_id: str) -> str | None:
    """Upload MP3 to Supabase Storage 'audio' bucket."""
    supabase_url = _get_supabase_url()
    supabase_key = _get_supabase_key()
    if not supabase_url or not supabase_key:
        return None

    file_name = f"{session_id}/{uuid.uuid4().hex[:8]}.mp3"
    upload_url = f"{supabase_url}/storage/v1/object/audio/{file_name}"
    headers = {
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "audio/mpeg",
        "x-upsert": "true",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(upload_url, headers=headers, content=audio_bytes)

        if resp.status_code in (200, 201):
            public_url = f"{supabase_url}/storage/v1/object/public/audio/{file_name}"
            return public_url

        # Bucket might not exist — create it
        if resp.status_code in (404, 400):
            await client.post(
                f"{supabase_url}/storage/v1/bucket",
                headers={
                    "Authorization": f"Bearer {supabase_key}",
                    "Content-Type": "application/json",
                },
                json={"id": "audio", "name": "audio", "public": True},
            )
            # Retry
            resp2 = await client.post(upload_url, headers=headers, content=audio_bytes)
            if resp2.status_code in (200, 201):
                return f"{supabase_url}/storage/v1/object/public/audio/{file_name}"

        print(f"Storage upload failed: {resp.status_code}")
        return None
