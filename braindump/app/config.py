"""Settings. Postgres is the single store. SQLite is the zero-setup default for local
dev and tests (the ORM is identical on both — there are no pgvector/embedding features).
Point DATABASE_URL at Neon for the real thing."""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # sqlite:///braindump.db (dev) | postgresql+psycopg://...@neon.tech/braindump (real)
    database_url: str = "sqlite:///braindump.db"

    # Reasoning engine (Claude) — not wired yet.
    anthropic_api_key: str | None = None


settings = Settings()
