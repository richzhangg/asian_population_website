from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    database_url: str = "postgresql+asyncpg://autm:autm_secret@localhost:5432/autm_db"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"
    openai_max_tokens: int = 1200

    # App
    environment: str = "development"
    secret_key: str = "change_me_in_production"
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "https://autm.vercel.app",
    ]

    # Cache TTLs (seconds)
    city_cache_ttl: int = 3600        # 1 hour
    ai_insight_cache_ttl: int = 86400 # 24 hours


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
