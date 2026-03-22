"""Chatterbox TTS via HuggingFace Spaces — free, high quality.

Flow: text → Chatterbox Space (Gradio API) → WAV → Supabase Storage → public URL
Each panelist gets distinct voice via different seed + exaggeration values."""

import httpx
import json
import os
import uuid
from app.config import settings

CHATTERBOX_URL = "https://resembleai-chatterbox.hf.space/gradio_api"

# Each panelist gets a unique seed + exaggeration for distinct voice
VOICE_PARAMS: dict[str, dict] = {
    "Elena Vásquez":       {"seed": 42,  "exaggeration": 0.4, "temperature": 0.9, "cfg_pace": 0.5},
    "Marcus Chen":         {"seed": 137, "exaggeration": 0.3, "temperature": 0.85, "cfg_pace": 0.6},
    "Sofia Andersen":      {"seed": 256, "exaggeration": 0.5, "temperature": 0.95, "cfg_pace": 0.45},
    "Ahmed Al-Rashid":     {"seed": 789, "exaggeration": 0.35, "temperature": 0.88, "cfg_pace": 0.55},
    "Dr. Ingrid Hoffmann": {"seed": 512, "exaggeration": 0.45, "temperature": 0.92, "cfg_pace": 0.5},
    "James Okafor":        {"seed": 333, "exaggeration": 0.3, "temperature": 0.87, "cfg_pace": 0.6},
    "Moderador":           {"seed": 100, "exaggeration": 0.25, "temperature": 0.8, "cfg_pace": 0.5},
    "Integrador":          {"seed": 200, "exaggeration": 0.3, "temperature": 0.85, "cfg_pace": 0.5},
}

DEFAULT_PARAMS = {"seed": 42, "exaggeration": 0.4, "temperature": 0.9, "cfg_pace": 0.5}


def _get_hf_token() -> str:
    return os.environ.get("HF_TOKEN", "") or os.environ.get("HUGGINGFACE_TOKEN", "")


def _get_supabase_jwt() -> str:
    jwt = os.environ.get("SUPABASE_JWT_KEY", "")
    if jwt:
        return jwt
    srk = settings.supabase_service_role_key or os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    return srk if srk.startswith("eyJ") else ""


async def generate_speech(text: str, agent_name: str, session_id: str) -> str | None:
    """Generate speech via Chatterbox, upload to Supabase Storage, return URL."""
    hf_token = _get_hf_token()

    # Clean text for TTS
    import re
    clean = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    clean = re.sub(r'\[CHALLENGE:[^\]]+\]', '', clean)
    clean = re.sub(r'#{1,3}\s', '', clean)
    clean = clean.strip()[:300]  # Chatterbox max 300 chars

    if len(clean) < 5:
        return None

    params = VOICE_PARAMS.get(agent_name, DEFAULT_PARAMS)
    headers = {"Content-Type": "application/json"}
    if hf_token:
        headers["Authorization"] = f"Bearer {hf_token}"

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            # Step 1: Submit job
            resp = await client.post(
                f"{CHATTERBOX_URL}/call/generate_tts_audio",
                headers=headers,
                json={
                    "data": [
                        clean,
                        None,  # reference audio
                        params["exaggeration"],
                        params["temperature"],
                        params["seed"],
                        params["cfg_pace"],
                        False,  # VAD trimming
                    ]
                },
            )

            if resp.status_code != 200:
                print(f"TTS submit error {resp.status_code}: {resp.text[:200]}")
                return None

            event_id = resp.json().get("event_id")
            if not event_id:
                print("TTS: No event_id returned")
                return None

            print(f"TTS: Job submitted for {agent_name}, event={event_id[:12]}...")

            # Step 2: Poll for result (SSE stream)
            result_resp = await client.get(
                f"{CHATTERBOX_URL}/call/generate_tts_audio/{event_id}",
                headers=headers,
                timeout=90.0,
            )

            audio_url_hf = None
            for line in result_resp.text.split("\n"):
                if line.startswith("data: "):
                    data_str = line[6:]
                    if data_str == "null":
                        continue
                    try:
                        data = json.loads(data_str)
                        if isinstance(data, list) and len(data) > 0:
                            audio_url_hf = data[0].get("url")
                    except json.JSONDecodeError:
                        pass

            if not audio_url_hf:
                print(f"TTS: No audio URL in response for {agent_name}")
                return None

            print(f"TTS: Audio ready for {agent_name}, downloading...")

            # Step 3: Download the audio
            audio_resp = await client.get(audio_url_hf, headers=headers)
            if audio_resp.status_code != 200:
                print(f"TTS: Download failed {audio_resp.status_code}")
                return None

            audio_bytes = audio_resp.content
            print(f"TTS: Downloaded {len(audio_bytes)//1000}KB for {agent_name}")

            # Step 4: Upload to Supabase Storage
            public_url = await _upload_to_storage(audio_bytes, session_id)
            return public_url

    except Exception as e:
        print(f"TTS exception for {agent_name}: {e}")
        return None


async def _upload_to_storage(audio_bytes: bytes, session_id: str) -> str | None:
    supabase_url = settings.supabase_url or os.environ.get("SUPABASE_URL", "")
    supabase_key = _get_supabase_jwt()

    if not supabase_url or not supabase_key:
        print("TTS: Missing Supabase credentials")
        return None

    file_name = f"{session_id}/{uuid.uuid4().hex[:8]}.wav"
    upload_url = f"{supabase_url}/storage/v1/object/audio/{file_name}"
    headers = {
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "audio/wav",
        "x-upsert": "true",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(upload_url, headers=headers, content=audio_bytes)

        if resp.status_code in (200, 201):
            return f"{supabase_url}/storage/v1/object/public/audio/{file_name}"

        if resp.status_code in (404, 400):
            # Create bucket
            await client.post(
                f"{supabase_url}/storage/v1/bucket",
                headers={"Authorization": f"Bearer {supabase_key}", "Content-Type": "application/json"},
                json={"id": "audio", "name": "audio", "public": True},
            )
            resp2 = await client.post(upload_url, headers=headers, content=audio_bytes)
            if resp2.status_code in (200, 201):
                return f"{supabase_url}/storage/v1/object/public/audio/{file_name}"

        print(f"TTS Storage error: {resp.status_code} {resp.text[:200]}")
        return None
