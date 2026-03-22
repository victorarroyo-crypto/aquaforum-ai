from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    tavily_api_key: str = ""
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    cors_origins: list[str] = ["http://localhost:3000"]
    langchain_tracing_v2: bool = False
    langchain_api_key: str = ""
    langchain_project: str = "aquaforum-ai"
    elevenlabs_api_key: str = ""
    hf_token: str = ""

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
