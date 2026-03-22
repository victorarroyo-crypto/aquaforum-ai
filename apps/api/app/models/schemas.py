from __future__ import annotations

from pydantic import BaseModel, Field


class AgentConfig(BaseModel):
    name: str
    role: str  # CEO, Analyst, Engineer, Regulator, Environmentalist
    persona: str
    color: str = "#06B6D4"
    avatar_url: str | None = None


class ForumConfig(BaseModel):
    topic: str
    panelists: list[AgentConfig] = Field(min_length=2, max_length=8)
    max_rounds: int = Field(default=3, ge=1, le=5)
    rules: list[str] = Field(default_factory=lambda: [
        "Mantén las intervenciones concisas y fundamentadas.",
        "Cita datos reales cuando sea posible.",
        "Respeta las posiciones de otros panelistas incluso al interpelar.",
        "El moderador puede intervenir para redirigir el debate.",
    ])


class StartForumResponse(BaseModel):
    session_id: str
    status: str = "running"


class SessionState(BaseModel):
    session_id: str
    topic: str
    status: str
    current_round: int
    max_rounds: int
    config: dict
    messages: list[dict] = []


class MessageOut(BaseModel):
    id: str
    session_id: str
    agent_name: str
    agent_role: str
    content: str
    message_type: str
    round_number: int
    turn_number: int
    metadata: dict = {}
    created_at: str


class ExportResponse(BaseModel):
    report_id: str
    content: str
