from __future__ import annotations

import json
import re

from langchain_core.messages import HumanMessage, SystemMessage

from app.engine.llm import get_llm
from app.engine.prompts import (
    AI_2027_CONTEXT,
    CHALLENGE_RESPONSE,
    EXPERT_ANALYSIS,
    FINAL_SUMMARY,
    INTEGRATOR,
    MODERATOR_CHECK,
    MODERATOR_OPEN,
    PANELIST_TURN,
    WATER_SECTOR_KNOWLEDGE,
)
from app.engine.state import ForumMessage, ForumState
from app.services import supabase_client as db

EXPERT_TYPES = [
    "viabilidad técnica",
    "impacto económico",
    "cumplimiento regulatorio",
    "sostenibilidad ambiental",
]

PIPELINE_STEPS = {
    "moderator_open": ("Moderador abre", 0.05),
    "agent_turn": ("Debate abierto", 0.3),
    "handle_challenge": ("Interpelación", 0.4),
    "moderator_check": ("Revisión moderador", 0.5),
    "expert_analysis": ("Análisis experto", 0.7),
    "integration": ("Integración", 0.85),
    "final_summary": ("Resumen final", 0.95),
}


def _format_panelists(panelists: list[dict]) -> str:
    lines = []
    for p in panelists:
        lines.append(f"- **{p['name']}** ({p['role']}): {p['persona']}")
    return "\n".join(lines)


def _format_recent_messages(messages: list[ForumMessage], limit: int = 12) -> str:
    recent = messages[-limit:] if len(messages) > limit else messages
    lines = []
    for m in recent:
        lines.append(f"**{m['agent_name']}** ({m['message_type']}): {m['content'][:500]}")
    return "\n\n".join(lines) if lines else "(Sin mensajes previos)"


def _format_rules(rules: list[str]) -> str:
    return "\n".join(f"- {r}" for r in rules)


async def _update_pipeline(session_id: str, node: str):
    label, progress = PIPELINE_STEPS.get(node, (node, 0.5))
    await db.update_pipeline_status(session_id, node, progress, {"label": label})


async def _persist_message(session_id: str, msg: ForumMessage) -> str:
    metadata = msg.get("metadata", {})
    # Audio generated on-demand via /forum/{id}/audio/{msg_id} endpoint
    return await db.add_message(
        session_id=session_id,
        agent_name=msg["agent_name"],
        agent_role=msg["agent_role"],
        content=msg["content"],
        message_type=msg["message_type"],
        round_number=msg["round_number"],
        turn_number=msg["turn_number"],
        metadata=metadata,
    )


async def moderator_open(state: ForumState) -> dict:
    await _update_pipeline(state["session_id"], "moderator_open")

    # Load memory from previous rounds
    memory_context = ""
    if state["current_round"] > 1:
        prev_messages = [
            m for m in state["messages"]
            if m["message_type"] in ("integration", "moderation")
        ]
        if prev_messages:
            memory_context = "**Resumen de rondas anteriores:**\n" + _format_recent_messages(
                prev_messages[-5:]
            )

    prompt = MODERATOR_OPEN.format(
        ai_2027_context=AI_2027_CONTEXT,
        water_knowledge=WATER_SECTOR_KNOWLEDGE,
        topic=state["topic"],
        panelists_description=_format_panelists(state["panelists"]),
        rules=_format_rules(state["rules"]),
        round_number=state["current_round"],
        max_rounds=state["max_rounds"],
        memory_context=memory_context,
    )

    llm = get_llm(temperature=0.5)
    response = await llm.ainvoke([SystemMessage(content=prompt), HumanMessage(content="Procede con tu intervención.")])

    msg: ForumMessage = {
        "agent_name": "Moderador",
        "agent_role": "moderator",
        "content": response.content,
        "message_type": "moderation",
        "round_number": state["current_round"],
        "turn_number": 0,
        "metadata": {"action": "open"},
    }

    await _persist_message(state["session_id"], msg)

    return {
        "messages": [msg],
        "current_agent_index": 0,
        "turn_count": 0,
        "pending_challenge": None,
        "should_end_round": False,
    }


async def agent_turn(state: ForumState) -> dict:
    await _update_pipeline(state["session_id"], "agent_turn")

    panelist = state["panelists"][state["current_agent_index"]]
    turn = state["turn_count"] + 1

    # Load agent memory
    memories = await db.get_agent_memories(state["session_id"], panelist["name"])
    memory_text = ""
    if memories:
        memory_text = "\n".join(
            f"- Ronda {m['round_number']}: {m['content']}" for m in memories
        )

    prompt = PANELIST_TURN.format(
        water_knowledge=WATER_SECTOR_KNOWLEDGE,
        name=panelist["name"],
        role=panelist["role"],
        persona=panelist["persona"],
        topic=state["topic"],
        recent_messages=_format_recent_messages(state["messages"]),
        agent_memory=memory_text or "(Primera intervención)",
        rules=_format_rules(state["rules"]),
    )

    llm = get_llm(temperature=0.8)
    response = await llm.ainvoke([SystemMessage(content=prompt), HumanMessage(content="Procede con tu intervención.")])
    content = response.content

    # Detect challenge pattern
    challenge_match = re.search(r"\[CHALLENGE:(\w[\w\s]*?)\]", content)
    pending_challenge = None
    message_type = "statement"

    if challenge_match:
        target_name = challenge_match.group(1).strip()
        message_type = "challenge"
        pending_challenge = {
            "challenger": panelist["name"],
            "target": target_name,
            "content": content,
        }

    msg: ForumMessage = {
        "agent_name": panelist["name"],
        "agent_role": panelist["role"],
        "content": content,
        "message_type": message_type,
        "round_number": state["current_round"],
        "turn_number": turn,
        "metadata": {"color": panelist.get("color", "#06B6D4")},
    }

    await _persist_message(state["session_id"], msg)

    # Save memory insight for this agent
    await db.save_memory(
        session_id=state["session_id"],
        agent_name=panelist["name"],
        memory_type="position",
        content=content[:300],
        round_number=state["current_round"],
    )

    # Advance to next agent
    next_index = (state["current_agent_index"] + 1) % len(state["panelists"])

    return {
        "messages": [msg],
        "turn_count": turn,
        "current_agent_index": next_index,
        "pending_challenge": pending_challenge,
    }


async def handle_challenge(state: ForumState) -> dict:
    await _update_pipeline(state["session_id"], "handle_challenge")

    challenge = state["pending_challenge"]
    if not challenge:
        return {"pending_challenge": None}

    # Find the target panelist
    target = None
    for p in state["panelists"]:
        if p["name"].lower() == challenge["target"].lower():
            target = p
            break

    if not target:
        # Target not found, skip
        return {"pending_challenge": None}

    prompt = CHALLENGE_RESPONSE.format(
        water_knowledge=WATER_SECTOR_KNOWLEDGE,
        name=target["name"],
        role=target["role"],
        persona=target["persona"],
        challenger_name=challenge["challenger"],
        challenge_content=challenge["content"],
        recent_messages=_format_recent_messages(state["messages"], limit=6),
    )

    llm = get_llm(temperature=0.7)
    response = await llm.ainvoke([SystemMessage(content=prompt), HumanMessage(content="Procede con tu intervención.")])

    msg: ForumMessage = {
        "agent_name": target["name"],
        "agent_role": target["role"],
        "content": response.content,
        "message_type": "response",
        "round_number": state["current_round"],
        "turn_number": state["turn_count"] + 1,
        "metadata": {"color": target.get("color", "#06B6D4"), "in_response_to": challenge["challenger"]},
    }

    await _persist_message(state["session_id"], msg)

    return {
        "messages": [msg],
        "turn_count": state["turn_count"] + 1,
        "pending_challenge": None,
    }


async def moderator_check(state: ForumState) -> dict:
    await _update_pipeline(state["session_id"], "moderator_check")

    # Count participation
    round_msgs = [m for m in state["messages"] if m["round_number"] == state["current_round"]]
    participation = {}
    for m in round_msgs:
        if m["agent_role"] != "moderator":
            participation[m["agent_name"]] = participation.get(m["agent_name"], 0) + 1

    participation_summary = "\n".join(
        f"- {name}: {count} intervenciones" for name, count in participation.items()
    )

    prompt = MODERATOR_CHECK.format(
        topic=state["topic"],
        round_number=state["current_round"],
        max_rounds=state["max_rounds"],
        turn_count=state["turn_count"],
        max_turns=state["max_turns_per_round"],
        recent_messages=_format_recent_messages(state["messages"], limit=8),
        participation_summary=participation_summary or "Sin intervenciones aún",
    )

    llm = get_llm(temperature=0.3)
    response = await llm.ainvoke([SystemMessage(content=prompt), HumanMessage(content="Procede con tu intervención.")])

    # Parse JSON response
    try:
        decision = json.loads(response.content)
    except json.JSONDecodeError:
        # Try to extract JSON from the response
        json_match = re.search(r"\{[^}]+\}", response.content)
        if json_match:
            decision = json.loads(json_match.group())
        else:
            decision = {"action": "cerrar", "message": "Cerremos esta ronda."}

    action = decision.get("action", "cerrar")
    message_text = decision.get("message", "")

    should_end = action == "cerrar" or state["turn_count"] >= state["max_turns_per_round"]

    if message_text:
        msg: ForumMessage = {
            "agent_name": "Moderador",
            "agent_role": "moderator",
            "content": message_text,
            "message_type": "moderation",
            "round_number": state["current_round"],
            "turn_number": state["turn_count"],
            "metadata": {"action": action},
        }
        await _persist_message(state["session_id"], msg)
        return {
            "messages": [msg],
            "should_end_round": should_end,
        }

    return {"should_end_round": should_end}


async def expert_analysis(state: ForumState) -> dict:
    await _update_pipeline(state["session_id"], "expert_analysis")

    round_msgs = [m for m in state["messages"] if m["round_number"] == state["current_round"]]
    round_text = _format_recent_messages(round_msgs, limit=30)

    new_messages = []

    for expert_type in EXPERT_TYPES:
        prompt = EXPERT_ANALYSIS.format(
            water_knowledge=WATER_SECTOR_KNOWLEDGE,
            expert_type=expert_type,
            topic=state["topic"],
            round_number=state["current_round"],
            round_messages=round_text,
            search_context="",
        )

        llm = get_llm(temperature=0.5)
        response = await llm.ainvoke([SystemMessage(content=prompt), HumanMessage(content="Procede con tu intervención.")])

        msg: ForumMessage = {
            "agent_name": f"Experto en {expert_type}",
            "agent_role": "expert",
            "content": response.content,
            "message_type": "analysis",
            "round_number": state["current_round"],
            "turn_number": 0,
            "metadata": {"expert_type": expert_type},
        }

        await _persist_message(state["session_id"], msg)
        await db.save_analysis(
            session_id=state["session_id"],
            round_number=state["current_round"],
            expert_type=expert_type,
            analysis=response.content,
        )

        new_messages.append(msg)

    return {"messages": new_messages}


async def integration(state: ForumState) -> dict:
    await _update_pipeline(state["session_id"], "integration")

    # Gather all expert analyses from this round
    analyses = [
        m for m in state["messages"]
        if m["message_type"] == "analysis" and m["round_number"] == state["current_round"]
    ]
    analyses_text = "\n\n---\n\n".join(
        f"**{m['agent_name']}:**\n{m['content']}" for m in analyses
    )

    prompt = INTEGRATOR.format(
        water_knowledge=WATER_SECTOR_KNOWLEDGE,
        topic=state["topic"],
        expert_analyses=analyses_text,
    )

    llm = get_llm(temperature=0.4)
    response = await llm.ainvoke([SystemMessage(content=prompt), HumanMessage(content="Procede con tu intervención.")])

    msg: ForumMessage = {
        "agent_name": "Integrador",
        "agent_role": "integrator",
        "content": response.content,
        "message_type": "integration",
        "round_number": state["current_round"],
        "turn_number": 0,
        "metadata": {},
    }

    await _persist_message(state["session_id"], msg)

    return {"messages": [msg]}


async def round_summary(state: ForumState) -> dict:
    """Inter-round summary: moderator synthesizes expert analysis + integration for the audience."""
    # Gather expert analyses and integration from this round
    round_analyses = [
        m for m in state["messages"]
        if m["message_type"] == "analysis" and m["round_number"] == state["current_round"]
    ]
    round_integration = [
        m for m in state["messages"]
        if m["message_type"] == "integration" and m["round_number"] == state["current_round"]
    ]

    analyses_text = "\n\n".join(
        f"**{m['agent_name']}:** {m['content'][:400]}" for m in round_analyses
    )
    integration_text = round_integration[0]["content"] if round_integration else ""

    # Key debate moments
    round_debate = [
        m for m in state["messages"]
        if m["round_number"] == state["current_round"] and m["message_type"] in ("statement", "challenge", "response")
    ]
    debate_highlights = _format_recent_messages(round_debate[-8:])

    prompt = f"""Eres el Moderador del foro AquaForum AI. Acabas de recibir el análisis del panel de expertos y la síntesis del integrador estratégico para la Ronda {state['current_round']}.

Tu tarea: presentar un RESUMEN EJECUTIVO de esta ronda al público. Debe ser claro, estructurado y accionable.

## Debate de esta ronda:
{debate_highlights}

## Análisis de expertos:
{analyses_text}

## Síntesis del integrador:
{integration_text}

## Instrucciones:
- Resume los puntos clave del debate en 3-4 bullets
- Destaca las tensiones o desacuerdos principales
- Incluye las conclusiones del análisis experto
- Anticipa brevemente qué se abordará en la siguiente ronda
- Tono: profesional pero accesible, como un presentador de conferencia
- Máximo 400 palabras"""

    llm = get_llm(temperature=0.4)
    response = await llm.ainvoke([SystemMessage(content=prompt), HumanMessage(content="Presenta el resumen de la ronda.")])

    msg: ForumMessage = {
        "agent_name": "Moderador",
        "agent_role": "moderator",
        "content": response.content,
        "message_type": "round_summary",
        "round_number": state["current_round"],
        "turn_number": 0,
        "metadata": {"summary_type": "inter_round"},
    }

    await _persist_message(state["session_id"], msg)

    return {"messages": [msg]}


async def final_summary(state: ForumState) -> dict:
    await _update_pipeline(state["session_id"], "final_summary")

    # Gather all integrations
    integrations = [m for m in state["messages"] if m["message_type"] == "integration"]
    integrations_text = "\n\n---\n\n".join(
        f"**Ronda {m['round_number']}:**\n{m['content']}" for m in integrations
    )

    # Key messages (challenges and responses)
    key_msgs = [
        m for m in state["messages"]
        if m["message_type"] in ("challenge", "response", "statement")
    ]
    key_text = _format_recent_messages(key_msgs[-15:])

    prompt = FINAL_SUMMARY.format(
        ai_2027_context=AI_2027_CONTEXT,
        water_knowledge=WATER_SECTOR_KNOWLEDGE,
        topic=state["topic"],
        all_integrations=integrations_text,
        key_messages=key_text,
    )

    llm = get_llm(temperature=0.4, max_tokens=4096)
    response = await llm.ainvoke([SystemMessage(content=prompt), HumanMessage(content="Procede con tu intervención.")])

    msg: ForumMessage = {
        "agent_name": "Moderador",
        "agent_role": "moderator",
        "content": response.content,
        "message_type": "summary",
        "round_number": state["current_round"],
        "turn_number": 0,
        "metadata": {"final": True},
    }

    await _persist_message(state["session_id"], msg)

    # Save as report
    await db.save_report(
        session_id=state["session_id"],
        report_type="summary",
        content=response.content,
    )

    return {"messages": [msg]}
