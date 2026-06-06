"""Build and query the derived index.

The contract this module exists to uphold: **you can delete the index and rebuild it
from the vault files, and get the same result.** `rebuild()` is that operation —
idempotent, full wipe-and-load. If this ever stops being true, the files are no longer
the source of truth.
"""

from __future__ import annotations

from pathlib import Path

import structlog

from app.database import Base, SessionLocal, engine
from app.domain.note import Note
from app.models.index import LinkRow, NoteRow, TaskRow

log = structlog.get_logger()

# Folders that hold real notes the index should cover. `raw/` and `snapshots/` are
# archives, `_changes/` is reports — none are indexed. `inbox/` is unprocessed capture;
# we index it so the dashboard can show "N items waiting for the gardener".
INDEXED_FOLDERS = ("notes", "inbox")


def iter_note_files(vault_path: Path) -> list[Path]:
    files: list[Path] = []
    for folder in INDEXED_FOLDERS:
        root = vault_path / folder
        if root.exists():
            files.extend(sorted(root.rglob("*.md")))
    return files


def rebuild(vault_path: Path) -> int:
    """Wipe the index and load every note from the vault. Returns notes indexed."""
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

    count = 0
    with SessionLocal() as session:
        for path in iter_note_files(vault_path):
            try:
                note = Note.from_file(path)
            except Exception:
                log.exception("failed to parse note, skipping", path=str(path))
                continue
            _load_note(session, note, vault_path)
            count += 1
        session.commit()

    log.info("index rebuilt", notes=count, vault=str(vault_path))
    return count


def _load_note(session: object, note: Note, vault_path: Path) -> None:
    rel = note.path.relative_to(vault_path) if note.path else Path(note.id)
    row = NoteRow(
        id=note.id,
        path=str(rel),
        type=note.type,
        status=note.status,
        source=note.source,
        title=note.title,
        created=note.created,
        updated=note.updated,
        due=note.due,
        project=note.project,
        people=note.people,
        tags=note.tags,
        body=note.body,
        content_hash=note.content_hash(),
    )
    row.tasks = [
        TaskRow(text=t.text, done=t.done, due=t.due, line_no=t.line_no)
        for t in note.tasks()
    ]
    session.add(row)  # type: ignore[attr-defined]
    for target in note.links():
        session.add(LinkRow(src_id=note.id, target=target))  # type: ignore[attr-defined]
