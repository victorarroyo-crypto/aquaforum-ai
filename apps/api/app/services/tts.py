"""ElevenLabs Text-to-Speech service for AquaForum AI.
Audio files stored in Supabase Storage, URLs returned in message metadata."""

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
    return settings.supabase_service_role_key or os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")


async def generate_speech(text: str, agent_name: str, session_id: str) -> str | None:
    """Generate speech and upload to Supabase Storage. Returns public URL or None."""
    api_key = _get_api_key()
    if not api_key:
        print("TTS: No API key")
        return None

    voice_id = VOICE_MAP.get(agent_name, DEFAULT_VOICE)
    speech_text = text[:1500] if len(text) > 1500 else text

    try:
        # 1. Generate audio from ElevenLabs
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{ELEVENLABS_API}/text-to-speech/{voice_id}",
                headers={
                    "xi-api-key": api_key,
                    "Content-Type": "application/json",
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
            )

            if response.status_code != 200:
                print(f"TTS ElevenLabs error {response.status_code}: {response.text[:200]}")
                return None

            audio_bytes = response.content
            print(f"TTS: Generated {len(audio_bytes)//1000}KB audio for {agent_name}")

        # 2. Upload to Supabase Storage
        supabase_url = _get_supabase_url()
        supabase_key = _get_supabase_key()
        if not supabase_url or not supabase_key:
            print("TTS: No Supabase credentials for storage")
            return None

        file_name = f"{session_id}/{uuid.uuid4().hex[:12]}.mp3"

        async with httpx.AsyncClient(timeout=15.0) as client:
            upload_resp = await client.post(
                f"{supabase_url}/storage/v1/object/audio/{file_name}",
                headers={
                    "Authorization": f"Bearer {supabase_key}",
                    "Content-Type": "audio/mpeg",
                    "x-upsert": "true",
                },
                content=audio_bytes,
            )

            if upload_resp.status_code in (200, 201):
                audio_url = f"{supabase_url}/storage/v1/object/public/audio/{file_name}"
                print(f"TTS: Uploaded to {audio_url}")
                return audio_url
            else:
                print(f"TTS Storage error {upload_resp.status_code}: {upload_resp.text[:200]}")
                # Fallback: try creating the bucket first
                if upload_resp.status_code == 404:
                    await _ensure_bucket(supabase_url, supabase_key)
                    # Retry upload
                    retry = await client.post(
                        f"{supabase_url}/storage/v1/object/audio/{file_name}",
                        headers={
                            "Authorization": f"Bearer {supabase_key}",
                            "Content-Type": "audio/mpeg",
                            "x-upsert": "true",
                        },
                        content=audio_bytes,
                    )
                    if retry.status_code in (200, 201):
                        audio_url = f"{supabase_url}/storage/v1/object/public/audio/{file_name}"
                        print(f"TTS: Uploaded (after bucket creation) to {audio_url}")
                        return audio_url
                    print(f"TTS Storage retry error {retry.status_code}: {retry.text[:200]}")
                return None

    except Exception as e:
        print(f"TTS exception: {e}")
        return None


async def _ensure_bucket(supabase_url: str, supabase_key: str):
    """Create the 'audio' bucket if it doesn't exist."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{supabase_url}/storage/v1/bucket",
                headers={
                    "Authorization": f"Bearer {supabase_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "id": "audio",
                    "name": "audio",
                    "public": True,
                },
            )
            print(f"TTS: Bucket creation response: {resp.status_code} {resp.text[:100]}")
    except Exception as e:
        print(f"TTS: Bucket creation error: {e}")
