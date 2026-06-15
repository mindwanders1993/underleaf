---
name: ul-execute
description: Enqueue an execute WorkItem for a spec. Usage `/ul-execute <module-id>`.
---

# /ul-execute — implement a spec

Drops an `execute` WorkItem in `agent_queue/in/` and runs the dispatcher.

## Steps

1. Verify `specs/<module-id>.md` exists. If not, suggest `/ul-spec <module-id>` first.
2. Compute id: `wi_<YYYY-MM-DD>_<module-id>_execute`.
3. Write `agent_queue/in/<id>.json`:
   ```json
   {
     "id": "<id>",
     "type": "execute",
     "module": "<module-id>",
     "spec_path": "specs/<module-id>.md",
     "branch": "feat/<module-id>",
     "success_criteria": ["npm run lint", "npm run build"],
     "model_hint": "gemini/gemini-2.5-pro"
   }
   ```
4. Shell out: `node scripts/dispatch.mjs --only execute`.
5. Tail `agent_queue/logs/<id>.log` while it runs.
6. Surface the WorkResult summary; if `next_action: review`, suggest `/ul-review feat/<module-id>`.
