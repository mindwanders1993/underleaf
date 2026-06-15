# Underleaf — Fleet Learnings

This is the running list of friction I hit while playing the implementer role across Modules 2–12, queued for the **fleet refinement PR** the user requested when we exit the implementer phase.

Each item is structured for direct paste into the `.claude/agents/*.md` definitions or related skill files.

---

## React 19 lint rules (3 modules in a row tripped on these)

The React 19 ESLint plugin is much stricter than 18. Three patterns are now blocked:

1. **Updating a ref during render** (e.g. `prevFileRef.current = file` inside the render body). Blocked by `react-hooks/refs`.
2. **`setState` inside `useEffect` to derive state from props** (e.g. `useEffect(() => setBytes(estimate(project)), [project])`). Blocked by `react-hooks/set-state-in-effect`.
3. **Wrapping caught errors without `cause`** (`throw new Error(...)` after `catch (err)`). Blocked by `preserve-caught-error`.

### Correct patterns

| When you want to… | Use this |
|---|---|
| Reset state when a prop changes | Outer/inner split with `key={prop}` on the inner |
| Derive a value from props/state | `useMemo`, not `useState` + `useEffect` |
| Track external state (e.g. `navigator.onLine`) | `useSyncExternalStore` |
| Subscribe to a store (Zustand) | Use the store's hook directly; don't mirror with local state |
| Re-throw a caught error with wrapper | `throw new Error('msg', { cause: err })` |

### Apply to fleet

Add a one-paragraph "React 19 idioms" section to `.claude/agents/execute.md` and the `/ul-execute` skill. The execute worker should ESLint against the current rule set early — failing fast on these is much cheaper than waiting for build time.

---

## `vi.stubGlobal('window', ...)` is a footgun

Module 2's engine tests do `vi.stubGlobal('window', { PdfTeXEngine: FakePdfTeXEngine })`. This clobbers the global `window` for the duration of the test file. With Vitest 4's test isolation it shouldn't leak across files — but the jsdom default for `localStorage` is fragile, and we ended up needing a `MemoryStorage` shim in `test-setup.ts` to keep persistence tests deterministic.

### Lesson

Prefer **`vi.spyOn(window, 'name', 'get')`** or `vi.mocked` over `vi.stubGlobal('window', …)`. Don't clobber the whole `window` unless you genuinely need to delete jsdom-provided APIs.

### Apply to fleet

Pin in `.claude/agents/test.md`: "Use targeted `vi.spyOn` over `vi.stubGlobal` for window/document/navigator. The latter erases other jsdom-provided APIs (notably `localStorage`) and can break sibling test files via shared globals."

---

## `vi.fn(async () => …)` types `mock.calls` as empty tuple

When you write:

```ts
const compileMock = vi.fn(async () => ({ pdfBuffer: ..., log: '', errors: [] }))
```

…the inferred type of `compileMock.mock.calls[0]` becomes `[]` (empty tuple), so indexing into `[0]` returns the never type. TypeScript catches it at build time.

### Fix

Declare the argument so the mock captures the input:

```ts
const compileMock = vi.fn(
  async (_input: LatexCompileInput): Promise<LatexCompileResult> => ({ ... }),
)
```

### Apply to fleet

`.claude/agents/test.md`: "For mocks where you intend to inspect `mock.calls[i][j]`, type the function arguments explicitly even if you don't use them in the implementation."

Also: add `argsIgnorePattern: '^_'` to the ESLint config (already done in this codebase's `eslint.config.js`) so the unused `_input` doesn't trip the lint.

---

## Spec format "Risks / open questions" repeatedly earned its keep

Three concrete examples:

1. **Module 5 — escape ordering**: the spec called for a "caret" test case. The first naive implementation double-escaped `\^{}`. Caught by the test.
2. **Module 5 — persistence load order**: the spec called out that hydration must run before saves, so a saved project overrides the default. The implementation respects this.
3. **Module 7 — JSON discipline**: spec said the parser must tolerate ```json fences and a leading sentence. Caught at test time because Module 11's first manual run on Ollama produced fenced JSON.

### Apply to fleet

`.claude/agents/spec.md`: emphasize that "Risks / open questions" must include at least one **testable failure mode** per acceptance criterion that can plausibly fail (escape ordering, race conditions, JSON dialect quirks, etc.).

---

## Template fidelity is a known half-truth

Module 6 ships **simplified** Deedy / Awesome-CV / RenderCV renderers. They produce visibly distinct output but they're not pixel-faithful to the originals. The PR was honest about this in the body.

### Apply to fleet

`.claude/agents/spec.md`: every spec that approximates an external artifact (a template, an API schema mapping, a specific LLM behaviour) must include a "Fidelity decision" risk line that names what's faithful, what's approximated, and what would justify reaching for the real artifact (vendored source, complex dependencies).

---

## `scripts/ship.sh` defaults `module` to `agent-fleet`

This is wrong. If the ship worker is invoked without a module arg, the PR title and commit get tagged `chore(agent-fleet): ...` regardless of what was actually shipped. Should fail fast instead.

### Fix

```bash
MODULE="${2:?module slug required, e.g. module-2-swiftlatex}"
```

---

## "I'm playing the worker" mode worked

When the worker CLIs (aider, gemini) weren't proven authed, the user opted into a temporary implementer phase. The architect (Claude) wrote the spec, then implemented against it, then shipped — playing all roles in sequence. Specs at `specs/module-{N}.md` survive as a paper trail; when worker auth is wired, those specs can be replayed.

### Apply to fleet

`docs/AGENT_FLEET.md`: document this "implementer-phase" mode as a valid fallback. Pre-conditions:
- User opts in explicitly.
- Architect still writes specs in `specs/` (paper trail).
- All other CLAUDE.md rules apply (branch from dev, conventional commits, never merge).

When phase ends, the architect compiles a `FLEET_LEARNINGS.md` (this doc) and folds it into the agent definitions.

---

## CSS surface area is growing

By Module 12 we have separate `.css` files for `AssistantDrawer`, `LearnDrawer`, `BackupModal`, `TemplatePickerModal`, `FileTree`, `PDFPreview`, `ExportMenu`, `OfflineBadge`. Many share visual primitives (drawer backdrop, button styles, etc.).

### Apply to fleet

`.claude/agents/execute.md`: add a "DRY trigger" — when a CSS rule for a positioning primitive (backdrop, drawer slide-in, modal centering) shows up in a second file, extract to a shared `ul-overlay.css` or token. Don't refactor on first occurrence (Karpathy rule #2), but the second is the signal.

---

## File-queue dispatcher worked unchanged

The `agent_queue/in/<id>.json` → `scripts/dispatch.mjs` → `agent_queue/out/<id>.result.json` flow remained correct across all of these modules even though only the spec slot got real WorkItems. The dispatcher's `--dry` smoke test from Module 1 caught a routing bug pre-emptively.

### No fleet change needed

Worth calling out as validated.

---

## TypeScript strict + `Record<string, unknown>` casts

`src/sync/projectIo.ts` had to use `as unknown as Project` to bridge the validated payload to the typed shape. TypeScript 6 catches the direct `as Project` cast — correctly, because the shape isn't proven yet.

### Apply to fleet

`.claude/agents/execute.md`: "When TypeScript blocks a cast you believe is safe because you just validated the shape at runtime, double-cast through `unknown` and add a code comment explaining the invariant. Never reach for `any`."

---

## Bundle discipline is real

Every module had a `≤ N KB` budget in the spec. We tracked main bundle size each PR and kept growth predictable. Lazy chunks (`PDFPreview`, `LearnDrawer`) kept heavy deps off the cold path.

### Apply to fleet

`.claude/agents/execute.md`: "Every PR that adds runtime dependencies must report the main-bundle delta in the commit message body. If a new dep is > 30 KB gzipped, default to `React.lazy` or dynamic `import()` and isolate to its surface."

---

## Open invitation

When you're ready to consolidate this into the actual fleet PR, the command is:

```bash
git checkout dev && git pull
git checkout -b chore/fleet-refinement-2026-06
# Apply the learnings above by editing the relevant .claude/agents/*.md
# Test the spec/execute/review/ship flow against a small module (e.g. PNG-icons PWA fix)
# Open PR to dev
```

Or have the architect take a pass during the next architect-mode session.
