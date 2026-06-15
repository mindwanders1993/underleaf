# module-8-ai-rewrite — Apply suggestions + inline Monaco AI rewrite + structured-mode JSON editor

## Goal

Close the loop opened by Module 7. Three concrete moves:

1. **Apply suggestion** — every JD-matcher suggestion gets an "Apply" button that finds the matching bullet in `resume.work[*].highlights[*]` and replaces it via the store. Applied state persists per-session per suggestion.
2. **Inline Monaco AI rewrite** — a single editor command **"Underleaf: Rewrite for impact"** (raw mode) sends the current selection (or current line) to the configured LLM and replaces it with the result. A small in-editor status appears while the call is in flight.
3. **Structured-mode JSON editor** — make `MonacoEditor` actually useful in structured mode. It shows `resume` as JSON; valid edits propagate to the store via a new `setResume` action; invalid JSON is held back with a tiny error overlay.

Module 8 is the last AI-product module before the polish modules (9–12). No streaming yet (still await-then-replace). The OpenAI/OpenRouter adapter is still deferred.

## Acceptance criteria

- [ ] `useProjectStore` gains `setResume(resume: ResumeData | null)` that replaces the whole resume object on `currentProject`. `updateResume(patch)` from Module 5 stays untouched.
- [ ] `JdMatchPanel` renders an "Apply" button on each suggestion. Clicking it locates the bullet by exact string match across all `work[*].highlights[*]`, swaps in the rewrite via `setResume`, and marks the suggestion as applied (button changes to "Applied", disabled). Suggestions are matched by index per analysis run.
- [ ] If the exact bullet is not found (user edited it after analysis), Apply shows a small inline error "Original bullet not found — re-run Analyze" and does **not** modify the store.
- [ ] In raw mode, `MonacoEditor` registers an action **`underleaf.rewriteForImpact`** with `keybindings: [Cmd+Alt+R / Ctrl+Alt+R]` and a context-menu entry. The action: reads the selection (or the current line if no selection), gates on `isProviderConfigured`, calls the LLM with a focused rewrite prompt, replaces the range with the result. While in flight, a tiny `[Underleaf · rewriting…]` status appears in the editor header.
- [ ] The Monaco action fails gracefully on LLM error — shows the message in the header for 4 seconds, leaves the text unchanged.
- [ ] In structured mode, `MonacoEditor` switches the model to a virtual `resume.json` document containing `JSON.stringify(project.resume, null, 2)`. Valid JSON edits debounce-call `setResume`. Invalid JSON keeps the prior store value and surfaces a tiny inline error in the editor header.
- [ ] When the user types in structured mode, the file name shown in the header changes to `resume.json` (read-only label).
- [ ] FileTree's "Eject to raw .tex" still works — and after eject the editor returns to its raw `.tex` flow without artefacts from the structured JSON view.
- [ ] `npm run lint`, `npm run build` clean. Main bundle growth ≤ 12 KB.
- [ ] Vitest covers: `setResume` action, apply-suggestion match + no-match + idempotent, Monaco action registration + selection replacement (mock the editor surface), structured Monaco JSON round-trip + invalid guard.

## Files to touch

- `src/store/useProjectStore.ts` — add `setResume(resume)`.
- `src/store/useProjectStore.test.ts` — add `setResume` test.
- `src/components/ai/JdMatchPanel.tsx` — add Apply button + applied-state map keyed by suggestion index.
- `src/components/ai/AssistantDrawer.test.tsx` — extend with apply suggestion flow.
- `src/components/editor/MonacoEditor.tsx` — branch on `project.mode`. In raw mode register the AI action. In structured mode swap content source + parse-on-change. **This file is already large — surgical edits only.**
- `src/components/editor/MonacoEditor.test.tsx` — new. Mock `@monaco-editor/react`; assert action registration in raw mode, JSON sync in structured mode.
- `src/ai/rewriteForImpact.ts` — new. Pure LLM-call helper that takes selection text + JD context (optional) + LLMClient and returns the rewrite. Keeps the prompt and parsing in one place.
- `src/ai/rewriteForImpact.test.ts` — new.
- `docs/LLD.md` — refresh §2.2 (MonacoEditor split path) + new §2.17 RewriteForImpact + apply path.

## Reuse first

- `src/store/useProjectStore.ts` — `updateResume(patch)` exists (Module 5) but only handles partial merges. `setResume` is a small addition; do not duplicate persistence logic.
- `src/components/editor/MonacoEditor.tsx` — the Monaco mount already exposes a `handleEditorDidMount` with the editor instance. Add `editor.addAction({...})` inside the existing hook; do not refactor the surrounding component.
- `src/llm/index.ts:isProviderConfigured` — already exists; reuse for both the Monaco gate and the Apply gate.
- `src/ai/jdMatcher.ts:JdSuggestion` — the suggestion type is the source of truth for Apply path.

## Test plan

- **Unit (Vitest)**:
  - `useProjectStore.test.ts` — `setResume` replaces the entire `resume` object; `setResume(null)` clears it.
  - `JdMatchPanel.test.tsx` (extend) — render with a fixture result, click Apply on a suggestion → store reflects the rewrite at the right work/highlight index; Apply button shows "Applied" and is disabled; clicking Apply with a suggestion whose `bullet` doesn't match any highlight shows the inline error and does not mutate the store.
  - `rewriteForImpact.test.ts` — mocked LLM returns a rewrite; returns stripped text (no leading code fence); returns the input on empty input (no LLM call).
  - `MonacoEditor.test.tsx` — mock `@monaco-editor/react`. Assert: raw mode registers `underleaf.rewriteForImpact` via `editor.addAction`; structured mode binds value to JSON of resume; emitting a change with invalid JSON does not call `setResume`; emitting a change with valid JSON does.
- **Manual**:
  - Raw mode: select a bullet, Cmd+Alt+R, observe the LLM rewriting the line; check the header shows "rewriting…" status while in flight.
  - Structured mode: AI Assist → JD Match → Analyze → click Apply on a suggestion → confirm the bullet updates in the structured JSON editor + re-compile + PDF reflects the change.

## Risks / open questions

- **Bullet-match brittleness**: exact string equality only. Whitespace differences will miss. Acceptable for v1 because the user just analyzed; the error message tells them to re-run. A fuzzier matcher (Levenshtein < threshold) is a future tune.
- **Monaco action surface**: only one action shipping (Rewrite for impact). Adding more is trivial later; one well-tested action is better than four half-baked ones.
- **Structured JSON editor UX**: no schema validation panel yet. Module 5 spec noted zod would arrive with a form editor; this module ships JSON-string editing (with parse-or-keep-prior semantics) as the structured surface. A form editor remains future work.
- **Concurrency**: the user could trigger an LLM rewrite, then change the selection, then trigger another rewrite. Each invocation captures its own selection range; we do **not** re-apply if the active range has shifted by the time the call returns (we apply to the original range coordinates).
- **Cost**: the Monaco action makes it easy to spam LLM calls. The action locks the editor's status for the duration; no global rate-limit.
- **Eject hygiene**: when the user ejects from structured to raw, `currentProject.resume` is cleared. MonacoEditor must respond by switching back to the raw-files view. Verified via the existing `mainFile` reactivity + `mode` gate.
