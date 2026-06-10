"""Create, update, and query notes in Postgres.

The store is authoritative. The only derived data is the `tasks`/`links` rows, which we
rebuild from a note's body on every write via `_sync_derived` — so they can never drift
from the markdown, but you still get to query them relationally.
"""

from __future__ import annotations

from datetime import date

from slugify import slugify
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.markdown import extract_links, extract_tasks
from app.models.note import Link, Note, Task


def make_id(title: str) -> str:
    return slugify(title) or "untitled"


def _sync_derived(note: Note) -> None:
    """Rebuild this note's task/link rows from its body. Called on every save."""
    note.tasks = [
        Task(text=t.text, done=t.done, due=t.due, line_no=t.line_no)
        for t in extract_tasks(note.body_md)
    ]
    note.links = [Link(target=target) for target in extract_links(note.body_md)]


def create_note(
    session: Session,
    *,
    id: str | None = None,
    body_md: str = "",
    type: str = "note",
    status: str = "inbox",
    source: str | None = None,
    title: str | None = None,
    due: date | None = None,
    project: list[str] | None = None,
    people: list[str] | None = None,
    tags: list[str] | None = None,
) -> Note:
    note = Note(
        id=id or make_id(title or body_md[:40] or "untitled"),
        type=type,
        status=status,
        source=source,
        title=title,
        body_md=body_md,
        due=due,
        project=project or [],
        people=people or [],
        tags=tags or [],
    )
    _sync_derived(note)
    session.add(note)
    session.commit()
    return note


def update_body(session: Session, note_id: str, body_md: str) -> Note | None:
    note = session.get(Note, note_id)
    if note is None:
        return None
    note.body_md = body_md
    _sync_derived(note)
    session.commit()
    return note


def list_notes(session: Session) -> list[Note]:
    return list(session.scalars(select(Note).order_by(Note.created_at)))


def list_open_tasks(session: Session) -> list[Task]:
    return list(session.scalars(select(Task).where(Task.done.is_(False)).order_by(Task.due)))
