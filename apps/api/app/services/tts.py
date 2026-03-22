"""ElevenLabs Text-to-Speech service for AquaForum AI."""

import httpx
import base64
from app.config import settings

ELEVENLABS_API = "https://api.elevenlabs.io/v1"

# Voice mapping: agent name → ElevenLabs voice_id
VOICE_MAP = {
    "Elena Vásquez": "EXAVITQu4vr4xnSDxMaL",   # Sarah - Mature, Confident
    "Marcus Chen": "onwK4e9ZLuTAKqWW03F9",       # Daniel - Steady Broadcaster
    "Sofia Andersen": "Xb7hH8MSUJpSbSDYk0k2",    # Alice - Clear Educator
    "Ahmed Al-Rashid": "JBFqnCBsd6RMkjVDRZzb",   # George - Warm British
    "Dr. Ingrid Hoffmann": "XrExE9yKIg1WjnnlVkGX", # Matilda - Professional
    "James Okafor": "nPczCjzI2devNBz1zQrb",       # Brian - Deep, Comforting
    "Moderador": "CwhRBWXzGAHq8TQ4Fs17",          # Roger - Laid-Back
    "Integrador": "cjVigY5qzO86Huf0OWal",         # Eric - Smooth, Trustworthy
}

DEFAULT_VOICE = "CwhRBWXzGAHq8TQ4Fs17"  # Roger


async def generate_speech(text: str, agent_name: str) -> str | None:
    """Generate speech audio for a message. Returns base64-encoded mp3 or None."""
    if not settings.elevenlabs_api_key:
        return None

    voice_id = VOICE_MAP.get(agent_name, DEFAULT_VOICE)

    # Truncate very long texts to save API quota
    speech_text = text[:1000] if len(text) > 1000 else text

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{ELEVENLABS_API}/text-to-speech/{voice_id}",
                headers={
                    "xi-api-key": settings.elevenlabs_api_key,
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

            if response.status_code == 200:
                audio_b64 = base64.b64encode(response.content).decode("utf-8")
                return audio_b64
            else:
                print(f"TTS error {response.status_code}: {response.text[:200]}")
                return None
    except Exception as e:
        print(f"TTS exception: {e}")
        return None
