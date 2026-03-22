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


async def _run_cycle(session_id: str, config: ForumConfig, round_number: int):
    """Run a debate cycle using the LangGraph engine."""
    try:
        await db.update_session_round(session_id, round_number)
        await db.update_session_status(session_id, "running")

        # Import here to avoid circular imports
        from app.engine.runner import run_forum_round

        await run_forum_round(session_id, config, round_number)

        # Check if this was the last round
        if round_number >= config.max_rounds:
            await db.update_session_status(session_id, "completed")

    except Exception as e:
        await db.update_session_status(session_id, "error")
        # Log error message to forum
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
    """Generate audio for a specific message on demand."""
    from app.services import supabase_client as db
    from app.services.tts import generate_speech

    # Check if already generated
    result = db.get_supabase().table("forum_messages").select("metadata,content,agent_name").eq("id", message_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Message not found")

    msg = result.data[0]
    existing_url = msg.get("metadata", {}).get("audio_url")
    if existing_url:
        return {"audio_url": existing_url}

    # Generate audio
    audio_url = await generate_speech(msg["content"], msg["agent_name"], session_id)
    if audio_url:
        await db.update_message_metadata(message_id, {"audio_url": audio_url})
        return {"audio_url": audio_url}

    raise HTTPException(status_code=500, detail="Audio generation failed")
