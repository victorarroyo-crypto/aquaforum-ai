from __future__ import annotations

import asyncio

from fastapi import APIRouter, BackgroundTasks, HTTPException

from app.models.schemas import (
    ExportResponse,
    ForumConfig,
    SessionState,
    StartForumResponse,
)
from app.services import supabase_client as db

router = APIRouter()

# Track running tasks to prevent concurrent cycles
_running_sessions: set[str] = set()


@router.post("/start", response_model=StartForumResponse)
async def start_forum(config: ForumConfig, background_tasks: BackgroundTasks):
    session_id = await db.create_session(
        topic=config.topic,
        config=config.model_dump(),
        max_rounds=config.max_rounds,
    )

    # Run the first cycle in the background
    _running_sessions.add(session_id)
    background_tasks.add_task(_run_cycle, session_id, config, 1)

    return StartForumResponse(session_id=session_id, status="running")


@router.post("/{session_id}/next-cycle", status_code=202)
async def next_cycle(session_id: str, background_tasks: BackgroundTasks):
    session = await db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session_id in _running_sessions:
        raise HTTPException(status_code=409, detail="A cycle is already running for this session")

    if session["status"] == "completed":
        raise HTTPException(status_code=400, detail="Session already completed")

    next_round = session["current_round"] + 1
    if next_round > session["max_rounds"]:
        raise HTTPException(status_code=400, detail="All rounds completed")

    config = ForumConfig(**session["config"])
    _running_sessions.add(session_id)
    background_tasks.add_task(_run_cycle, session_id, config, next_round)

    return {"status": "started", "cycle": next_round}


@router.post("/{session_id}/stop")
async def stop_forum(session_id: str):
    session = await db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    await db.update_session_status(session_id, "paused")
    _running_sessions.discard(session_id)
    return {"status": "paused"}


@router.get("/{session_id}/state", response_model=SessionState)
async def get_state(session_id: str):
    session = await db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = await db.get_messages(session_id)

    return SessionState(
        session_id=session["id"],
        topic=session["topic"],
        status=session["status"],
        current_round=session["current_round"],
        max_rounds=session["max_rounds"],
        config=session["config"],
        messages=messages,
    )


@router.post("/{session_id}/export", response_model=ExportResponse)
async def export_forum(session_id: str):
    session = await db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = await db.get_messages(session_id)

    # Build a Markdown report
    lines = [
        f"# AquaForum AI — Informe del Foro",
        f"## Tema: {session['topic']}",
        f"**Estado:** {session['status']} | **Rondas:** {session['current_round']}/{session['max_rounds']}",
        "",
        "---",
        "",
    ]

    current_round = 0
    for msg in messages:
        if msg["round_number"] != current_round:
            current_round = msg["round_number"]
            lines.append(f"## Ronda {current_round}")
            lines.append("")

        prefix = f"**{msg['agent_name']}** ({msg['agent_role']}) — _{msg['message_type']}_"
        lines.append(prefix)
        lines.append(msg["content"])
        lines.append("")

    content = "\n".join(lines)
    report_id = await db.save_report(session_id, "full", content)

    return ExportResponse(report_id=report_id, content=content)


@router.get("/{session_id}/export-docx")
async def export_docx(session_id: str):
    """Export expert analyses and integrations as a Word document."""
    import io
    import re

    from docx import Document
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.shared import Inches, Pt, RGBColor
    from fastapi.responses import StreamingResponse

    session = await db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = await db.get_messages(session_id)

    doc = Document()

    # Style setup
    style = doc.styles["Normal"]
    style.font.name = "Calibri"
    style.font.size = Pt(11)

    # Title
    title = doc.add_heading("AquaForum AI — Informe Ejecutivo", level=0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_paragraph(f"Tema: {session['topic']}")
    doc.add_paragraph(f"Rondas: {session.get('max_rounds', 4)} | Estado: {session['status']}")
    doc.add_paragraph("")

    # Group by round
    max_round = max((m["round_number"] for m in messages), default=0)

    for r in range(1, max_round + 1):
        doc.add_heading(f"Ronda {r}", level=1)

        # Round summary (moderator inter-round summary)
        summaries = [m for m in messages if m["round_number"] == r and m["message_type"] == "round_summary"]
        if summaries:
            doc.add_heading("Resumen del Moderador", level=2)
            clean = re.sub(r"\*\*([^*]+)\*\*", r"\1", summaries[0]["content"])
            clean = re.sub(r"#{1,3}\s*", "", clean)
            doc.add_paragraph(clean)

        # Expert analyses
        analyses = [m for m in messages if m["round_number"] == r and m["message_type"] == "analysis"]
        if analyses:
            doc.add_heading("Análisis de Expertos", level=2)
            for a in analyses:
                p = doc.add_paragraph()
                run = p.add_run(f"{a['agent_name']}")
                run.bold = True
                run.font.color.rgb = RGBColor(0x14, 0xB8, 0xA6)
                clean = re.sub(r"\*\*([^*]+)\*\*", r"\1", a["content"])
                clean = re.sub(r"#{1,3}\s*", "", clean)
                doc.add_paragraph(clean)

        # Integration
        integrations = [m for m in messages if m["round_number"] == r and m["message_type"] == "integration"]
        if integrations:
            doc.add_heading("Síntesis del Integrador", level=2)
            clean = re.sub(r"\*\*([^*]+)\*\*", r"\1", integrations[0]["content"])
            clean = re.sub(r"#{1,3}\s*", "", clean)
            doc.add_paragraph(clean)

        doc.add_page_break()

    # Final summary
    final = [m for m in messages if m["message_type"] == "summary"]
    if final:
        doc.add_heading("Resumen Final", level=1)
        clean = re.sub(r"\*\*([^*]+)\*\*", r"\1", final[-1]["content"])
        clean = re.sub(r"#{1,3}\s*", "", clean)
        doc.add_paragraph(clean)

    # Save to buffer
    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)

    filename = f"AquaForum_Informe_{session_id[:8]}.docx"
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


async def _run_cycle(session_id: str, config: ForumConfig, round_number: int):
    """Run ALL debate rounds automatically."""
    try:
        await db.update_session_status(session_id, "running")

        from app.engine.runner import run_all_rounds

        await run_all_rounds(session_id, config)
        await db.update_session_status(session_id, "completed")

    except Exception as e:
        await db.update_session_status(session_id, "error")
        await db.add_message(
            session_id=session_id,
            agent_name="Sistema",
            agent_role="system",
            content=f"Error en la ejecución: {str(e)}",
            message_type="moderation",
            round_number=round_number,
            turn_number=0,
            metadata={"error": True},
        )
    finally:
        _running_sessions.discard(session_id)


@router.get("/{session_id}/audio/{message_id}")
async def get_message_audio(session_id: str, message_id: str):
    """Generate audio on demand via Chatterbox (HuggingFace) — FREE."""
    import json as jsonlib
    import os
    import re
    import uuid
    import httpx as hx

    result = db.get_supabase().table("forum_messages").select("metadata,content,agent_name").eq("id", message_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Message not found")

    msg = result.data[0]
    existing_url = msg.get("metadata", {}).get("audio_url")
    if existing_url:
        return {"audio_url": existing_url}

    # Clean text (max 300 chars for Chatterbox)
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", msg["content"])
    text = re.sub(r"\[CHALLENGE:[^\]]+\]", "", text)
    text = re.sub(r"#{1,3}\s", "", text)
    text = re.sub(r"^(DECLARACIÓN|APOYO|INTERPELACIÓN|RESPUESTA)\s*", "", text, flags=re.IGNORECASE).strip()[:300]

    if len(text) < 5:
        raise HTTPException(status_code=400, detail="Text too short")

    # Voice params per agent (different seed = different voice)
    seeds = {"Elena Vásquez": 42, "Marcus Chen": 137, "Sofia Andersen": 256, "Ahmed Al-Rashid": 789, "Dr. Ingrid Hoffmann": 512, "James Okafor": 333, "Laura Martínez": 611, "Moderador": 100, "Integrador": 200}
    seed = seeds.get(msg["agent_name"], 42)

    hf_token = os.environ.get("HF_TOKEN", "")
    jwt = os.environ.get("SUPABASE_JWT_KEY", "")
    supa_url = os.environ.get("SUPABASE_URL", "")

    headers = {"Content-Type": "application/json"}
    if hf_token:
        headers["Authorization"] = f"Bearer {hf_token}"

    try:
        with hx.Client(timeout=90.0) as client:
            # Step 1: Submit to Chatterbox
            resp = client.post(
                "https://resembleai-chatterbox.hf.space/gradio_api/call/generate_tts_audio",
                headers=headers,
                json={"data": [text, None, 0.4, 0.9, seed, 0.5, False]},
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=500, detail=f"Chatterbox submit: {resp.status_code}")

            event_id = resp.json().get("event_id")
            if not event_id:
                raise HTTPException(status_code=500, detail="No event_id")

            # Step 2: Get result
            result_resp = client.get(
                f"https://resembleai-chatterbox.hf.space/gradio_api/call/generate_tts_audio/{event_id}",
                headers=headers,
                timeout=90.0,
            )

            audio_hf_url = None
            for line in result_resp.text.split("\n"):
                if line.startswith("data: ") and line[6:] != "null":
                    try:
                        data = jsonlib.loads(line[6:])
                        if isinstance(data, list) and data:
                            audio_hf_url = data[0].get("url")
                    except (jsonlib.JSONDecodeError, TypeError):
                        pass

            if not audio_hf_url:
                raise HTTPException(status_code=500, detail="No audio URL from Chatterbox")

            # Step 3: Download audio
            audio_resp = client.get(audio_hf_url, headers=headers)
            if audio_resp.status_code != 200:
                raise HTTPException(status_code=500, detail="Download failed")
            audio_bytes = audio_resp.content

            # Step 4: Upload to Supabase Storage
            if not jwt or not supa_url:
                raise HTTPException(status_code=500, detail="Missing Supabase creds")

            fname = f"{session_id}/{uuid.uuid4().hex[:8]}.wav"
            r = client.post(
                f"{supa_url}/storage/v1/object/audio/{fname}",
                headers={"Authorization": f"Bearer {jwt}", "Content-Type": "audio/wav", "x-upsert": "true"},
                content=audio_bytes,
            )
            if r.status_code not in (200, 201):
                raise HTTPException(status_code=500, detail=f"Storage: {r.status_code}")

        audio_url = f"{supa_url}/storage/v1/object/public/audio/{fname}"
        await db.update_message_metadata(message_id, {"audio_url": audio_url})
        return {"audio_url": audio_url}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
