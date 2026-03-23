from __future__ import annotations

from app.engine.state import ForumState


def route_after_agent_turn(state: ForumState) -> str:
    # If there's a pending challenge, handle it
    if state.get("pending_challenge"):
        return "handle_challenge"

    # If all panelists have spoken in this sub-round, check with moderator
    if state["current_agent_index"] == 0 and state["turn_count"] > 0:
        return "moderator_check"

    # If we've reached max turns, go to moderator check
    if state["turn_count"] >= state["max_turns_per_round"]:
        return "moderator_check"

    # Otherwise, next agent speaks
    return "agent_turn"


def route_after_moderator_check(state: ForumState) -> str:
    # If moderator says end round, go to expert analysis
    if state.get("should_end_round"):
        return "expert_analysis"

    # If we've exceeded max turns, force end
    if state["turn_count"] >= state["max_turns_per_round"]:
        return "expert_analysis"

    # Otherwise continue debate
    return "agent_turn"


def route_after_round_summary(state: ForumState) -> str:
    # If this is the final round, generate final summary
    if state.get("is_final_round"):
        return "final_summary"

    # Otherwise the round is done (runner.run_all_rounds handles next round)
    return "__end__"
