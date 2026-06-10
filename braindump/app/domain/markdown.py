"""Parsing helpers over a note's markdown body.

A note's body is plain markdown stored in Postgres. Two things inside it are
structured and worth pulling into their own queryable tables: checkbox tasks and
[[wikilinks]]. These functions are pure — given a body string, return what's in it.
The DAO calls them on every save to keep the derived `tasks`/`links` rows in sync.
"""

from __future__ import annotations

import re
from datetime import date

from pydantic import BaseModel

# `- [ ] do the thing 📅 2026-06-10` / `- [x] done thing`
_TASK_RE = re.compile(r"^\s*[-*]\s+\[(?P<done>[ xX])\]\s+(?P<text>.+?)\s*$")
_DUE_RE = re.compile(r"📅\s*(\d{4}-\d{2}-\d{2})")
_LINK_RE = re.compile(r"\[\[(.+?)\]\]")


class ParsedTask(BaseModel):
    text: str
    done: bool
    due: date | None = None
    line_no: int


def extract_tasks(body: str) -> list[ParsedTask]:
    out: list[ParsedTask] = []
    for i, line in enumerate(body.splitlines(), start=1):
        m = _TASK_RE.match(line)
        if not m:
            continue
        text = m.group("text")
        due_m = _DUE_RE.search(text)
        out.append(
            ParsedTask(
                text=text,
                done=m.group("done").lower() == "x",
                due=date.fromisoformat(due_m.group(1)) if due_m else None,
                line_no=i,
            )
        )
    return out


def extract_links(body: str) -> list[str]:
    """All [[wikilink]] targets in the body (the graph edges)."""
    return _LINK_RE.findall(body)
