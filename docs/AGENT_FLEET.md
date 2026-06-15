# Underleaf Agent Fleet

Single source of truth for how Underleaf is built by a fleet of worker agents supervised by an architect (Claude). This doc supersedes the overlapping bits of `agent_orchestration_plan.md`, `AGENT_PROMPTS.md`, `vibe_coding_framework.md`, and `claude_code_alternatives.md` — those four will be folded in by the docs worker's first consolidation pass.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Architect (Claude in Claude Code)                           │
│  - Writes specs, agent definitions, skills                   │
│  - Reviews diffs, makes design calls                         │
│  - DOES NOT implement modules                                │
└─────────────────────────┬────────────────────────────────────┘
                          │  drops WorkItems
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  agent_queue/in/<id>.json   (file-based queue)               │
└─────────────────────────┬────────────────────────────────────┘
                          │  polled by
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  scripts/dispatch.mjs       (Node, no framework)             │
│  - Resolves depends_on                                       │
│  - Routes by `type` to the matching worker CLI               │
│  - Captures logs → agent_queue/logs/<id>.log                 │
│  - Writes WorkResult → agent_queue/out/<id>.result.json      │
└─────────────────────────┬────────────────────────────────────┘
                          │  spawns
                          ▼
       ┌───────┬──────────┬─────────┬─────────┬──────┐
       ▼       ▼          ▼         ▼         ▼      ▼
     spec   execute     test     review    docs   ship
   (gemini)(aider)    (aider)  (gemini) (gemini)(gh+git)
```

## WorkItem contract

```jsonc
{
  "id":        "wi_<yyyy-mm-dd>_<slug>_<n>",
  "type":      "spec | execute | test | review | docs | graphify | ship",
  "module":    "module-2-swiftlatex",
  "spec_path": "specs/module-2-swiftlatex.md",
  "branch":    "feat/module-2-swiftlatex",
  "success_criteria": ["npm run lint", "npm run build"],
  "model_hint":       "gemini-2.5-pro",
  "depends_on":       []
}
```

`type` is the only required field besides `id`. Everything else is read by the worker that handles that type. See `agent_queue/README.md` for the full schema.

## Worker roster

| Worker | CLI | Default model | Responsibility |
|---|---|---|---|
| `spec` | gemini | gemini-2.5-pro | Convert roadmap entry → `specs/<id>.md` |
| `execute` | aider --architect | architect: gemini-2.5-pro, editor: gemini-2.5-flash / minimax-m3 / ollama:qwen3-coder | Implement spec, self-loop to green build |
| `test` | aider | ollama:qwen3-coder | Vitest + Playwright against acceptance criteria |
| `review` | gemini | gemini-2.5-pro | Diff review vs. CLAUDE.md invariants |
| `docs` | gemini | gemini-2.5-flash | Sync HLA / LLD / DEVELOPMENT_PLAN / AGENT_FLEET |
| `graphify` | claude | local | Refresh knowledge graph |
| `ship` | gh + git | n/a | Branch+commit+push+PR to `dev`. **NEVER merges.** |

Full prompts live in `.claude/agents/<name>.md`.

## Skills (driver surface)

| Skill | Action |
|---|---|
| `/ul-spec <module-id>` | Drop spec WorkItem, run dispatcher |
| `/ul-execute <module-id>` | Drop execute WorkItem, run dispatcher |
| `/ul-review <branch>` | Drop review WorkItem, run dispatcher |
| `/ul-ship <branch>` | Drop ship WorkItem, run dispatcher |
| `/ul-validate` | Local lint + tsc + build (CLAUDE.md invariant) |
| `/ul-add-component` | Scaffold a new component (design-system compliant) |
| `/ul-new-template` | Scaffold a LaTeX template in the gallery |

## End-to-end loop

1. `/ul-spec module-2-swiftlatex` → `specs/module-2-swiftlatex.md`.
2. Architect skims spec, edits in place if needed.
3. `/ul-execute module-2-swiftlatex` → branch + edits + green build.
4. `/ul-review feat/module-2-swiftlatex` → blockers / suggestions / verdict.
5. If `needs_changes`: rerun `/ul-execute` with the same spec + review notes appended.
6. If `ok`: `/ul-ship feat/module-2-swiftlatex` → PR URL to `dev`.
7. Architect reviews PR in GitHub UI. **User merges**, never the ship worker.
8. Post-merge: `docs` + `graphify` workers fire automatically (queue them in PR-C, see "Known follow-ups").

## Hard rules — non-negotiable

These mirror `CLAUDE.md` and apply to every worker:

1. Branch from `dev`, never `main`.
2. Conventional commits: `type(scope): subject`.
3. No `--no-verify`, no `--no-gpg-sign`, no `eslint-disable`/`@ts-ignore` without spec sign-off.
4. Surgical changes — touch only files listed in the spec.
5. No Tailwind, no CSS-in-JS. Vanilla CSS + design tokens.
6. All state through Zustand actions.
7. Ship worker NEVER merges. User merges via GitHub UI.

## Known follow-ups (after feat/project-scaffold lands on dev)

- `chore/roadmap-reshape`: reshape `docs/DEVELOPMENT_PLAN.md` per the architect plan; add **Module 12: Content/Blog system** (Harvard CES, Stanford BEAM, AI prompt cookbook, MDX inside the app).
- Add `npm run dispatch | spec | execute | review | ship` to `package.json`.
- Fold `docs/AGENT_PROMPTS.md`, `docs/vibe_coding_framework.md`, `docs/claude_code_alternatives.md`, and `agent_orchestration_plan.md` into this file (`docs` worker, first run, `module: doc-consolidation`).
- Wire a post-merge GitHub Action that auto-enqueues `docs` + `graphify` WorkItems.

## Why file-based queue, not a framework

We considered LangGraph, AutoGen, CrewAI, Temporal. All over-engineer this. The queue is N JSON files in a directory; the dispatcher is one Node script with `child_process.spawn`. It's trivially debuggable (cat a file), trivially extensible (add a key to the WORKERS map), and trivially replaceable when we outgrow it. Karpathy's working agreement #2 (simplicity first) wins.
