"""The Postgres schema. This IS the source of truth — a note is a row, its markdown
lives in `body_md`. `tasks` and `links` are derived from the body and kept in sync on
every save (see app/dao/notes.py); they're queryable but always reconstructable from
the body. No embeddings.

Arrays are stored as JSON so the same models run on SQLite (local/tests) and Postgres
(real, via Neon) unchanged.
"""

from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import JSON, Boolean, Date, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

# Note kind. PARA actionability lives in `status`, not folders.
VALID_TYPES = frozenset({"note", "meeting", "idea", "question", "reference", "person", "project", "inbox"})
VALID_STATUS = frozenset({"inbox", "active", "area", "resource", "archive"})


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    type: Mapped[str] = mapped_column(String, nullable=False, default="note")
    # New captures land as status="inbox" for the gardener to process.
    status: Mapped[str] = mapped_column(String, nullable=False, default="inbox")
    source: Mapped[str | None] = mapped_column(String)
    title: Mapped[str | None] = mapped_column(String)
    body_md: Mapped[str] = mapped_column(Text, nullable=False, default="")
    due: Mapped[date | None] = mapped_column(Date)
    project: Mapped[list[str]] = mapped_column(JSON, default=list)
    people: Mapped[list[str]] = mapped_column(JSON, default=list)
    tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    tasks: Mapped[list[Task]] = relationship(back_populates="note", cascade="all, delete-orphan")
    links: Mapped[list[Link]] = relationship(back_populates="note", cascade="all, delete-orphan")


class Task(Base):
    """A checkbox line parsed from a note's body. Derived — re-synced on save."""

    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    note_id: Mapped[str] = mapped_column(ForeignKey("notes.id", ondelete="CASCADE"))
    text: Mapped[str] = mapped_column(Text, nullable=False)
    done: Mapped[bool] = mapped_column(Boolean, default=False)
    due: Mapped[date | None] = mapped_column(Date)
    line_no: Mapped[int] = mapped_column(Integer, nullable=False)

    note: Mapped[Note] = relationship(back_populates="tasks")


class Link(Base):
    """A [[wikilink]] edge to a target (which may not exist yet). Derived."""

    __tablename__ = "links"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    note_id: Mapped[str] = mapped_column(ForeignKey("notes.id", ondelete="CASCADE"))
    target: Mapped[str] = mapped_column(String, nullable=False)

    note: Mapped[Note] = relationship(back_populates="links")
