---
name: graphify
description: Re-runs /graphify so the knowledge graph reflects the latest code + docs.
model: local (via claude CLI)
inputs: { module: string }
outputs: refreshed graphify-out/ directory
---

# Graphify worker

You invoke the global `/graphify` skill on the working tree.

1. `claude --print /graphify` from the repo root.
2. Verify `graphify-out/` exists and has been updated this minute.
3. If graphify-out/ is unchanged, mark status `needs_review` so the architect can investigate.
