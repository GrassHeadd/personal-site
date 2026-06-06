"""The foundation's central claim, as a test: the derived index is fully reconstructable
from the vault files, and rebuilding is deterministic (delete it, rebuild, identical result).
"""

from __future__ import annotations

from datetime import date
from pathlib import Path

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from app.dao import index as index_dao
from app.database import Base
from app.domain.note import Note
from app.models.index import NoteRow, TaskRow


@pytest.fixture
def vault(tmp_path: Path) -> Path:
    (tmp_path / "notes").mkdir()
    (tmp_path / "inbox").mkdir()
    Note(
        id="meeting-luke",
        type="meeting",
        status="active",
        created=date(2026, 6, 5),
        project=["didero-sourcing"],
        people=["luke"],
        tags=["work", "1on1"],
        body="# 1:1 with Luke\n\n- [ ] send deck 📅 2026-06-10\n- [x] book room\n",
    ).write(tmp_path)
    return tmp_path


@pytest.fixture(autouse=True)
def _sqlite(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    """Point the index at a throwaway SQLite file for each test."""
    db = tmp_path / "test-index.db"
    engine = create_engine(f"sqlite:///{db}", future=True)
    session_local = sessionmaker(bind=engine, future=True)
    monkeypatch.setattr(index_dao, "engine", engine)
    monkeypatch.setattr(index_dao, "SessionLocal", session_local)
    return engine, session_local


def test_round_trip_note_serialization(tmp_path: Path) -> None:
    note = Note(id="n1", type="idea", tags=["idea"], body="# Hi\n\nbody\n")
    path = note.write(tmp_path)
    reloaded = Note.from_file(path)
    assert reloaded.id == "n1"
    assert reloaded.type == "idea"
    assert reloaded.tags == ["idea"]
    assert reloaded.title == "Hi"


def test_rebuild_extracts_notes_tasks_and_links(vault: Path, _sqlite) -> None:
    _, session_local = _sqlite
    n = index_dao.rebuild(vault)
    assert n == 1
    with session_local() as s:
        note = s.scalars(select(NoteRow)).one()
        assert note.id == "meeting-luke"
        assert note.project == ["didero-sourcing"]
        tasks = s.scalars(select(TaskRow)).all()
        assert len(tasks) == 2
        open_task = next(t for t in tasks if not t.done)
        assert open_task.due == date(2026, 6, 10)


def test_index_is_disposable(vault: Path, _sqlite) -> None:
    """Delete everything and rebuild — same result. This is the whole point."""
    _, session_local = _sqlite

    def snapshot() -> list[tuple]:
        with session_local() as s:
            notes = [(r.id, r.content_hash) for r in s.scalars(select(NoteRow))]
            tasks = [(t.note_id, t.text, t.done) for t in s.scalars(select(TaskRow))]
        return sorted(notes), sorted(tasks)

    index_dao.rebuild(vault)
    first = snapshot()

    Base.metadata.drop_all(index_dao.engine)  # nuke the index
    index_dao.rebuild(vault)  # rebuild from files alone
    second = snapshot()

    assert first == second
