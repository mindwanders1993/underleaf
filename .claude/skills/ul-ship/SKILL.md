---
name: ul-ship
description: Push branch and open a PR to dev. Usage `/ul-ship <branch>`.
---

# /ul-ship — branch+commit+push+PR

Runs the ship worker via `scripts/ship.sh`.

## Pre-conditions

- Branch has passed `/ul-review` with `Verdict: ok`.
- Working tree clean OR ship.sh will auto-commit with `chore(<module>): agent worker auto-commit`.
- `gh` CLI authenticated.

## Steps

1. Drop a `ship` WorkItem in `agent_queue/in/`:
   ```json
   {
     "id": "wi_<YYYY-MM-DD>_<branch-slug>_ship",
     "type": "ship",
     "branch": "<branch>",
     "module": "<module-id>"
   }
   ```
2. Shell out: `node scripts/dispatch.mjs --only ship`.
3. Surface the PR URL from the WorkResult.
4. **Remind the user**: PR base is `dev`. The worker NEVER merges. Merge via GitHub UI after manual review.

## Will refuse to

- Target `main`.
- Use `--no-verify`.
- Force-push.
- Merge the PR.
