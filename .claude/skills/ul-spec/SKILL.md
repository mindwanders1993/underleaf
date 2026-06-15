---
name: ul-spec
description: Enqueue a spec WorkItem for a roadmap module. Usage `/ul-spec <module-id>`.
---

# /ul-spec — author a module spec

Drops a `spec` WorkItem in `agent_queue/in/` and runs the dispatcher once.

## Steps

1. Parse `<module-id>` from the user's invocation (e.g. `module-2-swiftlatex`).
2. Compute id: `wi_<YYYY-MM-DD>_<module-id>_spec`.
3. Write `agent_queue/in/<id>.json`:
   ```json
   {
     "id": "<id>",
     "type": "spec",
     "module": "<module-id>",
     "spec_path": "specs/<module-id>.md",
     "model_hint": "gemini-2.5-pro"
   }
   ```
4. Shell out: `node scripts/dispatch.mjs --only spec`.
5. Read `agent_queue/out/<id>.result.json` and surface the summary + spec path.

## Done means

`specs/<module-id>.md` exists, passes a quick read-back against `.claude/agents/spec.md` output format, and is ready for `/ul-execute`.
