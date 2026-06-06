"""Engine + session for the derived index.

Sync SQLAlchemy on purpose: rebuilding the index is a batch operation that walks the
filesystem (sync I/O), and SQLite is the local default. When the FastAPI app and the
Postgres swap arrive, that path can move to async (the house style) — the index is
disposable, so none of this is load-bearing.
"""

from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

engine = create_engine(settings.index_url, future=True)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False, future=True)


class Base(DeclarativeBase):
    pass
