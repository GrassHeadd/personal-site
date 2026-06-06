"""Settings. The two that matter for the foundation: where the vault is, and where
the (disposable) derived index lives."""

from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Source of truth. In real use, point this at your synced Obsidian/Syncthing
    # folder. Defaults to the repo's ./vault skeleton for development.
    vault_path: Path = Path("./vault")

    # Derived index. Disposable — the engine is a config detail. SQLite locally now;
    # swap to "postgresql+psycopg://..." later without touching the vault.
    index_url: str = "sqlite:///index.db"

    # Reasoning engine (Claude) — not wired yet.
    anthropic_api_key: str | None = None


settings = Settings()
