"""The capture-event shape (Section 2 of the spec).

Every ingest source (voice, Telegram, email, manual, webhook) normalizes to a
CaptureEvent before it becomes a note row. The optional context block is filled by
the intent layer (Section 3).
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class CaptureContext(BaseModel):
    """Optional before/during/after context the intent layer attaches."""

    participants: list[str] = Field(default_factory=list)
    topic: str | None = None
    goal: str | None = None
    live_markers: list[str] = Field(default_factory=list)
    debrief: str | None = None


class CaptureEvent(BaseModel):
    source: str  # voice | telegram | whatsapp | email | web | manual | webhook
    timestamp: datetime
    raw_payload: str
    transcript: str | None = None
    context: CaptureContext | None = None
    declared_intent: str | None = None  # e.g. "todo", "remind", set via prefix/slash
