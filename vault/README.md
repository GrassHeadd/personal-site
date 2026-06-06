# The Vault — conventions

This folder is the **source of truth**. Plain markdown, openable in Obsidian. Everything
else in the project (the SQLite/Postgres index, search, the dashboard) is *derived* from
these files and can be deleted and rebuilt at any time.

> In real use, this lives in your synced Obsidian/Syncthing folder, not in the repo.
> Point `VAULT_PATH` at it. The copy here is a skeleton + one example.

## Folders (two levels deep, max)

| Folder        | What it holds                          | Who writes it                         |
| ------------- | -------------------------------------- | ------------------------------------- |
| `inbox/`      | raw, unprocessed captures              | **ingest only, append-only**          |
| `notes/`      | organized atomic notes (one idea each) | **the gardener only**                 |
| `raw/`        | processed captures, archived           | the gardener (moves from `inbox/`)    |
| `_changes/`   | daily semantic change reports          | the gardener                          |
| `snapshots/`  | pre-run vault snapshots (rollback)     | the gardener (before each run)        |
| `_index.md`   | map of the vault                       | the gardener (proposes), you (approve)|
| `_tags.md`    | the **pinned, approved tag vocabulary**| the gardener (proposes), you (approve)|

**Write-path discipline (the safety model):** ingest only ever *appends* to `inbox/`.
The gardener is the *only* process that touches `notes/`. Raw input is never deleted,
only archived to `raw/`. A crashed run leaves `inbox/` intact and re-runs cleanly.

## Note format

One idea per file. YAML frontmatter is the schema; the body is markdown.

```markdown
---
id: didero-1on1-2026-06-05      # stable, = filename; used to link the index row
type: meeting                    # note | meeting | idea | question | reference | person | project
status: active                   # active | area | resource | archive  (PARA actionability)
source: voice                    # where it was captured
created: 2026-06-05
project: [[didero-sourcing]]     # wikilinks — the organizing layer, not folders
people: [[luke]]
tags: [work, 1on1]               # MUST come from _tags.md
---

# 1:1 with Luke

Notes go here. Tasks are checkboxes, read straight into the index:

- [ ] send Luke the sourcing deck 📅 2026-06-10
- [x] book the room
```

- **Tasks are not a note type.** They're checkbox lines (`- [ ] ... 📅 YYYY-MM-DD`,
  Obsidian Tasks format) inside any note. The index extracts them.
- **Tags must exist in `_tags.md`.** The gardener proposes additions there for your
  approval rather than inventing tags — this is what stops tag drift over months.
- **Organize with frontmatter + `[[wikilinks]]`, not deep folders** — a note can belong
  to a project AND a person AND an idea at once.
