"""Engine + session for the single Postgres store (SQLite locally).

Sync SQLAlchemy for now — simple and enough for the CLI and the gardener job. When the
FastAPI app arrives this can move to async (the house style); the models are unchanged.
"""

from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

engine = create_engine(settings.database_url, future=True)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False, future=True)


class Base(DeclarativeBase):
    pass
