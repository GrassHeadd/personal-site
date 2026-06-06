"""The note file format and the capture-event shape.

The vault is the source of truth. A note is a single markdown file: YAML frontmatter
(the schema) plus a markdown body. This module is the *only* place that knows how to
turn a file into a Note and a Note back into a file, so the format stays consistent
no matter who writes it (capture, the gardener, or a human in Obsidian).

Read `vault/README.md` for the human-facing conventions; this is the code contract.
Pure domain code: no database, no I/O beyond reading/writing a single file.
"""

from __future__ import annotations

import hashlib
import re
from datetime import date, datetime
from pathlib import Path

import frontmatter
import yaml
from pydantic import BaseModel, Field
from slugify import slugify

# --- The capture-event shape (Section 2 of the spec) -------------------------------
# Every ingest source normalizes to this before landing append-only in inbox/.


class CaptureContext(BaseModel):
    """Optional before/during/after context the intent layer attaches (Section 3)."""

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


# --- The note schema (Section 5b) ---------------------------------------------------
# Frontmatter fields. Tasks are NOT a note type — they are markdown checkbox lines
# inside a note body (Obsidian Tasks format), extracted by the index.

VALID_TYPES = frozenset({"note", "meeting", "idea", "question", "reference", "person", "project"})
# PARA actionability lives in `status`, not folders.
VALID_STATUS = frozenset({"active", "area", "resource", "archive"})

# `- [ ] do the thing 📅 2026-06-10` / `- [x] done thing`
_TASK_RE = re.compile(r"^\s*[-*]\s+\[(?P<done>[ xX])\]\s+(?P<text>.+?)\s*$")
_DUE_RE = re.compile(r"📅\s*(\d{4}-\d{2}-\d{2})")
_LINK_RE = re.compile(r"\[\[(.+?)\]\]")


class Task(BaseModel):
    text: str
    done: bool
    due: date | None = None
    line_no: int


class Note(BaseModel):
    """An in-memory note, parsed from or serialized to a single .md file."""

    id: str
    type: str = "note"
    status: str = "active"
    source: str | None = None
    created: date | None = None
    updated: date | None = None
    due: date | None = None
    project: list[str] = Field(default_factory=list)  # wikilink targets, no brackets
    people: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    title: str | None = None
    body: str = ""
    # Provenance — not persisted to frontmatter, set on load:
    path: Path | None = None

    # -- parsing ---------------------------------------------------------------------
    @classmethod
    def from_file(cls, path: Path) -> Note:
        post = frontmatter.load(str(path))
        meta = post.metadata
        body = post.content
        return cls(
            id=str(meta.get("id") or path.stem),
            type=str(meta.get("type", "note")),
            status=str(meta.get("status", "active")),
            source=_opt_str(meta.get("source")),
            created=_as_date(meta.get("created") or meta.get("date")),
            updated=_as_date(meta.get("updated")),
            due=_as_date(meta.get("due")),
            project=_link_list(meta.get("project")),
            people=_link_list(meta.get("people")),
            tags=_str_list(meta.get("tags")),
            title=_opt_str(meta.get("title")) or _first_heading(body),
            body=body,
            path=path,
        )

    def tasks(self) -> list[Task]:
        """Checkbox lines in the body become tasks in the index."""
        out: list[Task] = []
        for i, line in enumerate(self.body.splitlines(), start=1):
            m = _TASK_RE.match(line)
            if not m:
                continue
            text = m.group("text")
            due_m = _DUE_RE.search(text)
            out.append(
                Task(
                    text=text,
                    done=m.group("done").lower() == "x",
                    due=_as_date(due_m.group(1)) if due_m else None,
                    line_no=i,
                )
            )
        return out

    def links(self) -> list[str]:
        """All [[wikilink]] targets in the body (the graph edges)."""
        return _LINK_RE.findall(self.body)

    def content_hash(self) -> str:
        """Stable hash of the serialized note, for incremental indexing."""
        return hashlib.sha256(self.to_markdown().encode("utf-8")).hexdigest()

    # -- serialization ---------------------------------------------------------------
    def to_markdown(self) -> str:
        meta: dict[str, object] = {"id": self.id, "type": self.type, "status": self.status}
        if self.source:
            meta["source"] = self.source
        if self.created:
            meta["created"] = self.created.isoformat()
        if self.updated:
            meta["updated"] = self.updated.isoformat()
        if self.due:
            meta["due"] = self.due.isoformat()
        if self.project:
            meta["project"] = [f"[[{p}]]" for p in self.project]
        if self.people:
            meta["people"] = [f"[[{p}]]" for p in self.people]
        if self.tags:
            meta["tags"] = list(self.tags)
        fm = yaml.safe_dump(meta, sort_keys=False, allow_unicode=True).strip()
        return f"---\n{fm}\n---\n\n{self.body.lstrip()}\n"

    def write(self, vault_root: Path, folder: str = "notes") -> Path:
        target = vault_root / folder / f"{self.id}.md"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(self.to_markdown(), encoding="utf-8")
        self.path = target
        return target

    @staticmethod
    def make_id(title: str) -> str:
        return slugify(title) or "untitled"


# --- helpers ------------------------------------------------------------------------
def _opt_str(v: object) -> str | None:
    return None if v is None else str(v)


def _as_date(v: object) -> date | None:
    if v is None:
        return None
    if isinstance(v, datetime):
        return v.date()
    if isinstance(v, date):
        return v
    s = str(v).strip()
    return date.fromisoformat(s[:10]) if s else None


def _str_list(v: object) -> list[str]:
    if v is None:
        return []
    if isinstance(v, str):
        return [v]
    if isinstance(v, (list, tuple)):
        return [str(x) for x in v]
    return [str(v)]


def _link_list(v: object) -> list[str]:
    """Accept `[[target]]`, `target`, or a list of either; return bare targets."""
    out: list[str] = []
    for raw in _str_list(v):
        s = raw.strip()
        m = re.fullmatch(r"\[\[(.+?)\]\]", s)
        out.append(m.group(1) if m else s)
    return out


def _first_heading(body: str) -> str | None:
    for line in body.splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return None
