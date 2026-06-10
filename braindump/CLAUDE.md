# braindump — Claude instructions

Voice-first personal knowledge OS. Solo user. Successor to the TS `grassdump` (archived).
Full design: `spec/ARCHITECTURE.md`.

## Invariants — do not violate these

1. **The vault is the source of truth. The index is disposable.** Anything in the
   SQLite/Postgres index must be reconstructable from `vault/` files by `braindump rebuild`.
   Never make the index authoritative.
2. **Write-path discipline.** Ingest only ever *appends* to `vault/inbox/`. The gardener
   is the *only* process that mutates `vault/notes/`. Raw captures are archived to
   `vault/raw/`, never deleted. This is the safety model — keep runs idempotent.
3. **Never silently edit human notes or invent tags.** Tags come from `vault/_tags.md`;
   the gardener *proposes* additions for approval. The gardener emits a semantic change
   report (`vault/_changes/DATE.md`) and snapshots before a run.
4. **Don't boil the ocean.** Build the ends of the pipe first (capture, output).
   Reasoning is orchestration. Storage is Obsidian — don't rebuild it.

## House style (matches didero/fast-api)

- **uv** for deps (`uv sync`, `uv run ...`). **`app/`** package layout.
- **pydantic-settings** config (`app/config.py`), **SQLAlchemy 2.0**, **structlog**.
- **ruff** (line-length 140) + **pyright** (`make lint`). Type everything.
- **pydantic-ai** (Anthropic) is the LLM framework for the reasoning layer when we get there.
- Tests mirror `app/`. Run with `uv run pytest`.
- Postgres + pgvector is the eventual index DB; SQLite is the local default now. The
  swap is config-only because the index is disposable.

## Module map (`app/`)

- `domain/` — pure types (the `Note` format, `CaptureEvent`). No I/O, no DB.
- `models/`, `dao/` — the derived index (ORM + rebuild/query).
- `services/{ingest,intent,reasoning,output}/` — the four layers. Stubs for now.
- `config.py`, `database.py`, `cli.py` — wiring.

## Working with JJ

- Backend/ML engineer, strongest in FastAPI/Python. No need to teach Python basics.
- Plain language, short sentences, no fluff. Explain non-obvious design choices, not syntax.
