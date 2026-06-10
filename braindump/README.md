# braindump

A voice-first personal knowledge OS. Capture anything (mostly by voice) with near-zero
friction, let an LLM triage and organize it into a markdown knowledge base, and get a
calendar-aware daily plan, reminders, and output suggestions back out.

Successor to the TypeScript `grassdump` (archived). Fresh Python/FastAPI build — see
`spec/ARCHITECTURE.md` for the full design and the decisions/rejections behind it.

## The one idea

**The Obsidian vault (plain markdown) is the source of truth. Everything else is a
disposable derived index.** You could delete the database and rebuild it from the files.
If that ever stops being true, the files aren't really the truth anymore.

```
[ INGEST ] -> [ INTENT ] -> [ REASONING ] -> [ STORAGE: Obsidian vault ]  <- truth
  capture       triage        gardener              |
                                                    v
                                          [ derived index: SQLite/Postgres ]  <- disposable
                                                    |
                                                    v
                                          [ OUTPUT: dashboard, plan, reminders ]
```

## What's built so far

The **markdown vault foundation** — the contract everything else sits on:

- `vault/` — the vault skeleton + conventions (`vault/README.md`)
- `app/domain/note.py` — the note file format + the capture-event shape
- `app/models/index.py`, `app/dao/index.py` — the disposable derived index
- `braindump rebuild` — proves the property: delete the index, rebuild from files

Not built yet (have a home in `app/services/`, no code): ingest adapters, ASR, the
gardener, the output dashboard, the Postgres/pgvector swap.

## Quickstart

```bash
uv sync
uv run braindump rebuild        # build the index from ./vault
uv run braindump notes          # list indexed notes
uv run braindump tasks          # list open tasks (checkboxes) across the vault
uv run pytest              # incl. the "index is disposable" test
```

Copy `.env.example` to `.env` to point `VAULT_PATH` at your real Obsidian vault.

## Build sequence

`v0` manual loop → `v1` automate the gardener → `v2` output layer → `v3` intent/breadth →
`v4` semantic search. Build the ends of the pipe first (capture, output). See the spec.
