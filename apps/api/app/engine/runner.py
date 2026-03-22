from __future__ import annotations

from app.engine.graph import build_forum_graph
from app.engine.state import ForumState
from app.models.schemas import ForumConfig


async def run_forum_round(session_id: str, config: ForumConfig, round_number: int):
    """Run a single round of the forum debate."""
    graph = build_forum_graph()

    is_final = round_number >= config.max_rounds

    initial_state: ForumState = {
        "session_id": session_id,
        "topic": config.topic,
        "panelists": [p.model_dump() for p in config.panelists],
        "rules": config.rules,
        "messages": [],
        "current_round": round_number,
        "max_rounds": config.max_rounds,
        "current_agent_index": 0,
        "turn_count": 0,
        "max_turns_per_round": len(config.panelists) * 2,
        "pending_challenge": None,
        "should_end_round": False,
        "is_final_round": is_final,
    }

    # Run the graph to completion
    async for _chunk in graph.astream(initial_state, stream_mode="updates"):
        # Nodes handle their own persistence to Supabase.
        # Supabase Realtime delivers messages to the frontend.
        pass
