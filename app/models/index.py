"""ORM tables for the derived index. Every row here is reconstructable from a vault
file — nothing is authoritative. `content_hash` exists so a future incremental rebuild
can skip unchanged notes; the current rebuild is a full wipe-and-load.
"""

from __future__ import annotations

from datetime import date

from sqlalchemy import JSON, Boolean, Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class NoteRow(Base):
    __tablename__ = "notes"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    path: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False)
    source: Mapped[str | None] = mapped_column(String)
    title: Mapped[str | None] = mapped_column(String)
    created: Mapped[date | None] = mapped_column(Date)
    updated: Mapped[date | None] = mapped_column(Date)
    due: Mapped[date | None] = mapped_column(Date)
    project: Mapped[list[str]] = mapped_column(JSON, default=list)
    people: Mapped[list[str]] = mapped_column(JSON, default=list)
    tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    body: Mapped[str] = mapped_column(Text, default="")
    content_hash: Mapped[str] = mapped_column(String, nullable=False)

    tasks: Mapped[list[TaskRow]] = relationship(
        back_populates="note", cascade="all, delete-orphan"
    )


class TaskRow(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    note_id: Mapped[str] = mapped_column(ForeignKey("notes.id", ondelete="CASCADE"))
    text: Mapped[str] = mapped_column(Text, nullable=False)
    done: Mapped[bool] = mapped_column(Boolean, default=False)
    due: Mapped[date | None] = mapped_column(Date)
    line_no: Mapped[int] = mapped_column(Integer, nullable=False)

    note: Mapped[NoteRow] = relationship(back_populates="tasks")


class LinkRow(Base):
    """A [[wikilink]] edge from one note to a target (the target may not exist yet)."""

    __tablename__ = "links"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    src_id: Mapped[str] = mapped_column(ForeignKey("notes.id", ondelete="CASCADE"))
    target: Mapped[str] = mapped_column(String, nullable=False)
