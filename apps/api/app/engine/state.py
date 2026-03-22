from __future__ import annotations

import operator
from typing import Annotated, TypedDict


class ForumMessage(TypedDict):
    agent_name: str
    agent_role: str
    content: str
    message_type: str  # statement | challenge | response | moderation | analysis | integration | summary
    round_number: int
    turn_number: int
    metadata: dict


class ForumState(TypedDict):
    session_id: str
    topic: str
    panelists: list[dict]  # AgentConfig dicts
    rules: list[str]
    messages: Annotated[list[ForumMessage], operator.add]
    current_round: int
    max_rounds: int
    current_agent_index: int
    turn_count: int
    max_turns_per_round: int
    pending_challenge: dict | None  # {challenger, target, content}
    should_end_round: bool
    is_final_round: bool
