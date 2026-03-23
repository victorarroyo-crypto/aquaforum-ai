from langgraph.graph import END, START, StateGraph

from app.engine.nodes import (
    agent_turn,
    expert_analysis,
    final_summary,
    handle_challenge,
    integration,
    moderator_check,
    moderator_open,
    round_summary,
)
from app.engine.routing import (
    route_after_agent_turn,
    route_after_moderator_check,
    route_after_round_summary,
)
from app.engine.state import ForumState


def build_forum_graph() -> StateGraph:
    builder = StateGraph(ForumState)

    # Add nodes
    builder.add_node("moderator_open", moderator_open)
    builder.add_node("agent_turn", agent_turn)
    builder.add_node("handle_challenge", handle_challenge)
    builder.add_node("moderator_check", moderator_check)
    builder.add_node("expert_analysis", expert_analysis)
    builder.add_node("integration", integration)
    builder.add_node("round_summary", round_summary)
    builder.add_node("final_summary", final_summary)

    # Start → moderator opens the round
    builder.add_edge(START, "moderator_open")

    # After moderator opens → first agent speaks
    builder.add_edge("moderator_open", "agent_turn")

    # After agent turn → conditional routing
    builder.add_conditional_edges(
        "agent_turn",
        route_after_agent_turn,
        {
            "handle_challenge": "handle_challenge",
            "moderator_check": "moderator_check",
            "agent_turn": "agent_turn",
        },
    )

    # After handling challenge → next agent continues
    builder.add_edge("handle_challenge", "agent_turn")

    # After moderator check → conditional routing
    builder.add_conditional_edges(
        "moderator_check",
        route_after_moderator_check,
        {
            "expert_analysis": "expert_analysis",
            "agent_turn": "agent_turn",
        },
    )

    # After expert analysis → integration
    builder.add_edge("expert_analysis", "integration")

    # After integration → round_summary
    builder.add_edge("integration", "round_summary")

    # After round summary → final_summary (if last round) or END
    builder.add_conditional_edges(
        "round_summary",
        route_after_round_summary,
        {
            "final_summary": "final_summary",
            "__end__": END,
        },
    )

    # Final summary → end
    builder.add_edge("final_summary", END)

    return builder.compile()
