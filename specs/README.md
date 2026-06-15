# specs/

Module specs authored by the `spec` worker and consumed by the `execute` / `test` / `review` workers.

One markdown file per module: `specs/<module-id>.md` (e.g. `specs/module-2-swiftlatex.md`).

## File format (enforced by `.claude/agents/spec.md`)

```markdown
# <module-id> — <title>

## Goal
One paragraph describing what "done" means in user-visible terms.

## Acceptance criteria
- [ ] Each bullet is verifiable by a single command or Playwright step.

## Files to touch
- `path/to/file` — what changes.

## Reuse first
- `src/store/useProjectStore.ts:42` — `updateFileContent` action.
- (existing utilities and components to lean on)

## Test plan
- Unit (Vitest): which files, which assertions.
- E2E (Playwright): which user flow, which selectors.
- Manual: what to click/type to verify.

## Risks / open questions
- Anything the architect must decide before execute starts.
```

## Lifecycle

1. `/ul-spec <module-id>` → spec worker creates `specs/<module-id>.md`.
2. Architect (you) eyeballs the spec; edits in place if needed.
3. `/ul-execute <module-id>` → execute worker implements against the spec.
4. `/ul-review feat/<module-id>` → review worker grades the diff.
5. `/ul-ship feat/<module-id>` → ship worker opens PR to `dev`.
6. User merges PR via GitHub UI.
7. `docs` and `graphify` workers fire post-merge.

Specs are checked into the repo so PRs link back to the spec they implement.
