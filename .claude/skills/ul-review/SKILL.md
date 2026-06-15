---
name: ul-review
description: Run the review worker against a branch. Usage `/ul-review <branch>`.
---

# /ul-review — review a branch diff

Drops a `review` WorkItem in `agent_queue/in/`.

## Steps

1. Verify branch exists locally: `git rev-parse --verify <branch>`.
2. Compute id: `wi_<YYYY-MM-DD>_<branch-slug>_review`.
3. Write `agent_queue/in/<id>.json`:
   ```json
   {
     "id": "<id>",
     "type": "review",
     "branch": "<branch>",
     "model_hint": "gemini-2.5-pro"
   }
   ```
4. Shell out: `node scripts/dispatch.mjs --only review`.
5. Print the review notes verbatim. If `Verdict: needs_changes`, suggest `/ul-execute` again with the same spec.
