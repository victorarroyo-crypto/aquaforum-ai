from langchain_anthropic import ChatAnthropic

from app.config import settings


def get_llm(temperature: float = 0.7, max_tokens: int = 2048) -> ChatAnthropic:
    return ChatAnthropic(
        model="claude-sonnet-4-20250514",
        temperature=temperature,
        max_tokens=max_tokens,
        anthropic_api_key=settings.anthropic_api_key,
    )
