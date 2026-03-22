from __future__ import annotations

import uuid

from supabase import Client, create_client

from app.config import settings

_client: Client | None = None


def get_supabase() -> Client:
    global _client
    if _client is None:
        _client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return _client


async def create_session(topic: str, config: dict, max_rounds: int) -> str:
    db = get_supabase()
    session_id = str(uuid.uuid4())
    db.table("forum_sessions").insert({
        "id": session_id,
        "topic": topic,
        "config": config,
        "status": "running",
        "current_round": 0,
        "max_rounds": max_rounds,
    }).execute()
    return session_id


async def get_session(session_id: str) -> dict | None:
    db = get_supabase()
    result = db.table("forum_sessions").select("*").eq("id", session_id).single().execute()
    return result.data


async def update_session_status(session_id: str, status: str):
    db = get_supabase()
    db.table("forum_sessions").update({"status": status}).eq("id", session_id).execute()


async def update_session_round(session_id: str, round_number: int):
    db = get_supabase()
    db.table("forum_sessions").update({"current_round": round_number}).eq(
        "id", session_id
    ).execute()


async def add_message(
    session_id: str,
    agent_name: str,
    agent_role: str,
    content: str,
    message_type: str,
    round_number: int,
    turn_number: int,
    metadata: dict | None = None,
) -> str:
    db = get_supabase()
    msg_id = str(uuid.uuid4())
    db.table("forum_messages").insert({
        "id": msg_id,
        "session_id": session_id,
        "agent_name": agent_name,
        "agent_role": agent_role,
        "content": content,
        "message_type": message_type,
        "round_number": round_number,
        "turn_number": turn_number,
        "metadata": metadata or {},
    }).execute()
    return msg_id


async def get_messages(session_id: str) -> list[dict]:
    db = get_supabase()
    result = (
        db.table("forum_messages")
        .select("*")
        .eq("session_id", session_id)
        .order("created_at")
        .execute()
    )
    return result.data


async def update_pipeline_status(
    session_id: str, current_node: str, progress: float, metadata: dict | None = None
):
    db = get_supabase()
    # Upsert by session_id
    db.table("pipeline_status").upsert({
        "session_id": session_id,
        "current_node": current_node,
        "progress": progress,
        "metadata": metadata or {},
    }, on_conflict="session_id").execute()


async def save_analysis(
    session_id: str,
    round_number: int,
    expert_type: str,
    analysis: str,
    key_insights: list[dict] | None = None,
):
    db = get_supabase()
    db.table("round_analyses").insert({
        "session_id": session_id,
        "round_number": round_number,
        "expert_type": expert_type,
        "analysis": analysis,
        "key_insights": key_insights or [],
    }).execute()


async def save_memory(
    session_id: str,
    agent_name: str,
    memory_type: str,
    content: str,
    round_number: int,
):
    db = get_supabase()
    db.table("agent_memory").insert({
        "session_id": session_id,
        "agent_name": agent_name,
        "memory_type": memory_type,
        "content": content,
        "round_number": round_number,
    }).execute()


async def get_agent_memories(session_id: str, agent_name: str) -> list[dict]:
    db = get_supabase()
    result = (
        db.table("agent_memory")
        .select("*")
        .eq("session_id", session_id)
        .eq("agent_name", agent_name)
        .order("round_number")
        .execute()
    )
    return result.data


async def save_report(session_id: str, report_type: str, content: str, metadata: dict | None = None) -> str:
    db = get_supabase()
    report_id = str(uuid.uuid4())
    db.table("reports").insert({
        "id": report_id,
        "session_id": session_id,
        "report_type": report_type,
        "content": content,
        "metadata": metadata or {},
    }).execute()
    return report_id
