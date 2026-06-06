# Personal Knowledge OS — Architecture

A voice-first personal knowledge operating system. Solo user, personal scale. Used
for school and daily life management. Built by a backend/ML engineer most comfortable
in FastAPI/Python, on Postgres + pgvector.

---

## 0. Concept and constraints

- **What it is:** capture anything (mostly by voice) with near-zero friction, have an
  LLM triage and organize it into a markdown knowledge base, and get a calendar-aware
  daily plan, reminders, and output suggestions back out.
- **Scale:** one user. Hundreds to low thousands of notes. Not multi-user, not a product (yet).
- **Languages:** transcription must handle Chinese, English, and Singapore code-switching
  (Singlish + Mandarin-English mixing).
- **Builder profile:** strongest in FastAPI/Python; comfortable with Postgres, pgvector,
  AWS; ML/post-training background.
- **Design priority:** own the data forever (plain files), keep the system maintainable
  by one person, build only the parts that aren't already solved off the shelf.

## 1. Architecture overview

Four conceptual layers, implemented as **modules in a single FastAPI monolith**, not microservices.

```
[ INGEST ] --> [ INTENT ] --> [ REASONING ] --> [ STORAGE (Obsidian) ]
    capture        triage         cleaner /          source of truth
   (voice, etc)   classify &     gardener +              |
                    route        distill/express         v
                                                    [ derived index ]
                                                    (SQLite + FTS,
                                                     optional vectors)
                                                          |
                                                          v
                                                   [ OUTPUT ]
                                               dashboard, daily plan,
                                               reminders, email, chat
```

- Ingest -> Intent -> Reasoning -> Storage is background plumbing. Triggers + schedules.
- Output is the only layer with a daily UI.
- The four layers are **modules, not services.** Split into processes only by runtime
  characteristics, not by conceptual layer (Section 7).

**Effort allocation:** real builds are **Ingest** (voice capture + adapters) and
**Output** (dashboard + scheduling brain) — the ends of the pipe, the parts not off the
shelf. Reasoning is mostly prompts + orchestration. Storage is Obsidian; do not build it.
Long-tail connectors: use an existing automation tool, do not build a workflow engine.

## 2. Ingest layer

Multi-source capture, normalized into a single event shape, landing append-only in `inbox/`.

- **Primary path — voice quick-capture:** a Wispr Flow-style global launcher (desktop
  hotkey; mobile share-sheet / shortcut / widget). Fire from anywhere, speak, it
  transcribes and drops a note into `inbox/`. A launcher, NOT a UI tab.
- **Speech-to-text (Chinese / English / Singlish):** candidate open models:
  - **Qwen3-ASR** (Alibaba, 0.6B / 1.7B): SOTA open ASR, 52 languages, robust, finetuning repo + Docker.
  - **FireRedASR / FireRedASR2** (Xiaohongshu): Mandarin specialist, strong on dialects.
  - **MERaLiON-AudioLLM** (Singapore): purpose-built for local accent + code-switching; benchmark vs Qwen3-ASR on real audio.
  - **Finetuning:** optional. Worth it for Singlish / Mandarin-English code-switch + domain vocab.
    Datasets: IMDA National Speech Corpus, CS-Dialogue.
  - **Diarization:** pyannote, for "who said what" in meetings.
- **Other mediums:** Telegram, WhatsApp, email, web clipper, manual text.
- **Extensibility:** a clean adapter interface (every source normalizes to one
  capture-event shape and writes to `inbox/`) plus one **generic webhook intake endpoint**.
  For the long tail, self-host **n8n or Activepieces** posting to the webhook.

Capture event shape:
`{ source, timestamp, raw_payload, transcript?, context?: { participants, topic, goal, live_markers, debrief }, declared_intent? }`

## 3. Intent / context layer

An **optional context layer** the user attaches to a capture, especially around the
meeting/recording lifecycle. Not primarily an auto-classifier.

### Context elicitation around a recording (before / during / after)
- **Before (highest leverage):** ~10s pre-capture prompt — who/what/desired outcome.
  Primes the pipe: labels speakers for diarization, tells the cleaner which project/people
  to file under, focuses the summary.
- **During (live markers):** lightweight in-the-moment flags (tap / spoken keyword) that
  become anchors the cleaner prioritizes. (This is what Granola does.)
- **After (debrief):** quick post-capture prompt — takeaways, todos, how it went. The
  distill step at the right moment.

All optional. When skipped, fall back to **auto-inference**: classify (task / reminder /
idea / question / note) and route (task -> dated task line; reminder -> notification;
question -> answer + save; note/idea -> stays in `inbox/`). User can declare intent fast
via prefix ("todo:", "remind:").

### Where it lives
A **capture-time enrichment in the ingest layer** that attaches a context block to the
capture event, feeding reasoning (sharper filing/linking/summaries) and output (a stated
before-intent becomes a follow-up the system can check later).

## 4. Reasoning layer

The LLM does the work here. Orchestrated by Python; the model is Claude (API or Claude Code).

### 4a. The daily cleaner / "gardener" (write side)
- Reads new items from `inbox/`, writes **atomic notes** (one idea per file) with correct
  YAML frontmatter, links them into the graph, keeps tags within a **pinned vocabulary**
  (`_tags.md`), updates a **map-of-content** (`_index.md`).
- **Write-path discipline (critical for safety):**
  - Ingestion only ever *appends* new files to `inbox/`. Never edits existing notes.
  - The cleaner is the *only* process that mutates the organized vault.
  - Raw input is never deleted; archived to `raw/` after processing. Runs are idempotent
    and retry-safe.
- **Review gate:** the cleaner emits a human-readable **semantic change report**
  (`_changes/DATE.md`) describing intent ("merged [[A]] into [[B]], created [[C]] from
  inbox item X, added #foo to 3 notes, archived [[D]]"). User approves, then it applies.
  A **snapshot is taken before the run** so a bad run is one restore away.
- **Execution:** scheduled job (Claude Code Cloud Routine, or `claude -p` headless via the
  worker) plus on-demand.

### 4b. Distill and express (read/interactive side)
- **Distill:** interactive thinking-partner sessions over note clusters; human-in-the-loop.
- **Express:** brainstorm/draft grounded in the vault.
- On-demand interactive modes, distinct from the automated daily cleaner.

## 5. Storage layer (Obsidian = source of truth)

### 5a. Source of truth
The **Obsidian vault (plain markdown)** is canonical. NOT stored inside the webapp. The
webapp operates *on* the vault (writes `inbox/`, reads the derived index) but is not a note
editor. Browsing/editing happens in Obsidian. Rebuilding a note editor = rebuilding Obsidian.

### 5b. Organization
- Flat-ish (two levels deep max). Organizing layer is **frontmatter (schema) + wikilinks**,
  not deep folders (a note belongs to multiple contexts).
- Keep PARA's actionability (project/area/resource/archive) as a frontmatter `status`, not folders.
- **Load-bearing consistency mechanism:** `_index.md` (map) + `_tags.md` (pinned, approved
  vocabulary). The cleaner *proposes* vocabulary additions rather than silently inventing tags.
- Example frontmatter:
  ```yaml
  ---
  type: meeting
  status: active
  project: [[didero-sourcing]]
  people: [[luke]]
  tags: [work, 1on1]
  date: 2026-06-05
  ---
  ```

### 5c. Derived index (disposable)
- Rebuilt from the vault; never authoritative; can be deleted and regenerated.
- **Structured queries:** SQLite (or Postgres) over frontmatter. Powers tasks/status/daily plan.
- **Keyword search:** Postgres full-text search.
- **Semantic search / RAG (OPTIONAL, deferrable):** pgvector. Not load-bearing. Later version.

### 5d. Versioning / checkpoint / rollback (NOT git-as-UX)
- **Concurrency:** solved by single-mutator write-path; git not needed.
- **Checkpoint / rollback:** snapshot the vault right before each cleaner run
  (copy to `snapshots/DATE/`; cleaner: restic or Syncthing versioning).
- **History (personal edits):** Obsidian Sync version history, or the snapshots.
- Git optional; if used, an invisible server-side journal, not the user's versioning UI.

### 5e. Sync
Syncthing (free, local-first) or Obsidian Sync.

## 6. Output layer (the part used daily)

The only layer with a real UI. A **daily dashboard / control plane**.

- **Tasks:** markdown checkboxes with due dates in the vault (Obsidian Tasks plugin format,
  `- [ ] submit DSA assignment 📅 2026-06-10`). Read back through the index. No separate store.
- **Calendar:** integrate Google Calendar — read schedule to inform the plan; optionally
  write deadlines/exams reasoning extracts.
- **Daily plan:** a **scheduled morning agent** reads today's calendar + open tasks + recent
  captures and produces a prioritized briefing.
- **Reminders:** via **Telegram** (same bot as ingestion) and/or email.
- **Output:** draft emails via Gmail; proactively surface deadlines / notes to revisit.
- **School use:** deadlines/exams/module tasks become dated tasks; morning agent surfaces them.

## 7. Tech stack

- **Backend:** FastAPI (Python), modular monolith. Modules: ingest, intent, reasoning, output.
- **Database:** Postgres + pgvector.
- **Background worker:** procrastinate (Postgres-backed job queue, no Redis).
- **Scheduled LLM jobs:** Claude Code Cloud Routines, or `claude -p` headless via worker/cron.
- **Reasoning engine:** Claude (API or Claude Code).
- **ASR:** separate worker (GPU) or hosted endpoint. Separated by runtime, not architecture.
- **Storage UI:** Obsidian. Sync via Syncthing or Obsidian Sync.
- **Connectors (long tail):** self-hosted n8n or Activepieces -> webhook.

**Process split (genuinely separate, and why):**
1. The FastAPI app (request serving + dashboard + capture intake).
2. One background worker (queued jobs).
3. ASR inference (GPU).
4. Scheduled LLM jobs (Cloud Routines / cron).

Not microservices. Split by runtime characteristics, not by diagram.

## 8. UI surfaces

- A **global quick-capture launcher** (Wispr-style).
- A **daily dashboard** (plan, tasks, reminders, approve the cleaner's change report).
- An optional **chat-over-my-brain** view.
- A **settings panel** for ingestion sources.

Ingest, reasoning, and storage do not need their own tabs.

## 9. Decisions made, options rejected

- **Obsidian as source of truth**, disposable derived index. (Rejected: DB-as-truth.)
- **Flat + frontmatter + links + pinned vocab.** (Rejected: deep folders as primary structure.)
- **Snapshot + semantic change report** for versioning. (Rejected: git as user-facing versioning.)
- **FastAPI fresh build.** (Rejected: extending an existing TypeScript project — ML/ASR/LLM
  ecosystem is Python-native, FastAPI is the builder's strongest tool. Also rejected: forking
  Khoj — Django, inverted data model, AGPL-3.0.)
- **Modular monolith.** (Rejected: microservices.)
- **Embeddings deferred** to a later version.
- **Intention scoped to optional context elicitation** (before/during/after), not a mandatory
  classifier. Auto-inference is only the fallback.
- **Claude Code (headless / Cloud Routines)** for the automated cleaner.

## 10. Open feasibility / research questions

(Validated separately — see research findings doc. Summary: architecture sound; ASR is the
highest-risk component; start with MERaLiON-2 / Qwen3-ASR, do NOT finetune until WER is
measured on real audio; the dominant project risk is abandonment, not tech.)

1. Code-switch ASR accuracy and finetuning value.
2. Markdown-as-source-of-truth + disposable index at personal scale.
3. Safe LLM autonomy (controlled vocab + index file + human review + idempotent writes).
4. Context elicitation UX + intent-inference fallback accuracy.
5. Versioning soundness (snapshot + change report vs git).
6. Scheduling/orchestration reliability (Cloud Routines vs `claude -p`+cron vs procrastinate).
7. Build-vs-buy justification (multi-source ingestion + calendar-aware output).
8. Cost at personal volume.

## 11. Build sequence (do not boil the ocean)

- **v0 (working brain, minimal build):** voice quick-capture into `inbox/` + Obsidian +
  Syncthing + manual cleaning via Claude Code using the librarian prompt. Validates the loop
  with almost no infrastructure.
- **v1 (automate the cleaner):** headless/Cloud-Routine cleaner with the change-report review
  gate; structured index (SQLite + Postgres FTS); snapshot-before-run.
- **v2 (output layer):** morning agent, tasks via Tasks plugin, Google Calendar, Telegram reminders.
- **v3 (intention + breadth):** before/during/after context UX, auto-inference fallback + routing,
  more ingestion adapters via n8n, email drafting + proactive suggestions.
- **v4 (optional):** pgvector embeddings for semantic search and chat-over-brain.

Build the ends of the pipe first (capture and output). Reasoning is orchestration. Storage is off the shelf.

---

## Foundation status (this repo)

Stage being built first: **the markdown vault foundation** (the contract underneath v0/v1).
- Vault structure + conventions: `vault/README.md`
- Note file format + capture-event shape: `src/grassdump_os/store/note.py`
- Disposable derived index (rebuildable from files): `src/grassdump_os/store/index.py`
- Proof of the core property — delete the index, rebuild from files, identical result:
  `braindump rebuild` / `tests/test_rebuild.py`

Not yet built (have a home, no code): FastAPI app, ingest adapters, ASR, the gardener,
the output dashboard, Postgres/pgvector swap.
