# agent_queue

File-based work queue for the Underleaf agent fleet. The dispatcher (`scripts/dispatch.mjs`) consumes WorkItems from `in/`, runs the matching worker, and writes WorkResults to `out/` with full logs in `logs/`.

## Layout

```
agent_queue/
  in/        # WorkItem JSON files, picked up by dispatcher
  out/       # WorkResult JSON files (one per processed item)
  logs/      # Per-item stdout/stderr capture
```

## WorkItem schema

```jsonc
{
  "id":        "wi_<yyyy-mm-dd>_<slug>_<n>",      // unique
  "type":      "spec | execute | test | review | docs | graphify | ship",
  "module":    "module-2-swiftlatex",              // free-form tag
  "spec_path": "specs/module-2-swiftlatex.md",     // required for execute/test/review
  "branch":    "feat/module-2-swiftlatex",         // required for execute/review/ship
  "success_criteria": ["npm run lint", "npm run build"],
  "model_hint":       "gemini-2.5-pro",            // optional override
  "depends_on":       []                           // ids of prerequisite items
}
```

## WorkResult schema

```jsonc
{
  "id":          "wi_...",
  "type":        "execute",
  "status":      "ok | fail | needs_review",
  "artifacts":   ["specs/...md", "src/..."],
  "log_path":    "agent_queue/logs/wi_....log",
  "next_action": "review | ship | retry | done",
  "summary":     "one-line human description",
  "started_at":  "2026-06-15T18:11:00Z",
  "finished_at": "2026-06-15T18:14:22Z"
}
```

## Running

```bash
node scripts/dispatch.mjs            # process every pending item, then exit
node scripts/dispatch.mjs --watch    # poll forever (1s interval)
node scripts/dispatch.mjs --only execute   # filter by type
node scripts/dispatch.mjs --dry      # print routing decisions, no exec
```

The dispatcher is intentionally a single ~200-line Node script — no framework, easy to fork or replace.
