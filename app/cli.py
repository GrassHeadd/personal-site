"""`gdos` — the command line for the derived index.

The foundation's whole claim is testable from here:
    gdos rebuild      # build the index from the vault
    rm index.db
    gdos rebuild      # ...and it comes back identical
"""

from __future__ import annotations

import typer
from sqlalchemy import select

from app.config import settings
from app.dao import index as index_dao
from app.database import SessionLocal
from app.models.index import NoteRow, TaskRow

app = typer.Typer(help="grassdump-os: operate on the vault's derived index.")


@app.command()
def rebuild() -> None:
    """Delete and rebuild the derived index from the vault files."""
    n = index_dao.rebuild(settings.vault_path)
    typer.echo(f"Indexed {n} notes from {settings.vault_path}")


@app.command()
def tasks(*, open_only: bool = True) -> None:
    """List tasks (markdown checkboxes) found across the vault."""
    with SessionLocal() as session:
        stmt = select(TaskRow)
        if open_only:
            stmt = stmt.where(TaskRow.done.is_(False))
        rows = session.scalars(stmt.order_by(TaskRow.due)).all()
        for t in rows:
            box = "x" if t.done else " "
            typer.echo(f"[{box}] {t.text}  ({t.note_id})")
        typer.echo(f"\n{len(rows)} task(s)")


@app.command()
def notes() -> None:
    """List indexed notes."""
    with SessionLocal() as session:
        rows = session.scalars(select(NoteRow).order_by(NoteRow.created)).all()
        for n in rows:
            tags = " ".join(f"#{t}" for t in n.tags)
            typer.echo(f"{n.id:30}  {n.type:10}  {n.status:8}  {tags}")
        typer.echo(f"\n{len(rows)} note(s)")


if __name__ == "__main__":
    app()
