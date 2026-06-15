# Underleaf — Next Steps

The roadmap modules 0–12 are all merged. This is the backlog of work that emerged during implementation, grouped by intent. Each item includes enough context to decide priority and assign.

## Tier 1 — Real bugs / blockers (do first)

### 🔴 PR #16 — unblock first-run
**State:** Open, ready to merge.

Without this, `npm run fetch:engine` 404s on a fresh checkout and the browser blocks Ollama / Gemini fetches. **Merge before anyone else tries to run the app.**

## Tier 2 — Friction the user hit in the implementer-phase sprint

These should be folded into the agent-fleet definitions before the next architect-driven build cycle. Living checklist in `FLEET_LEARNINGS.md`.

### Fleet refinement PR (~half a day)
- `.claude/agents/execute.md` — add a React 19 lint cheatsheet (no `setState` in render, no `setState` in effect for derived state — use `useMemo` or `key`, prefer `useSyncExternalStore` for external subscriptions, attach `{ cause: err }` to wrapped errors).
- `.claude/agents/test.md` — note that `vi.stubGlobal('window', ...)` clobbers `localStorage` for the rest of the file (and via test isolation, can affect siblings). Prefer `vi.spyOn` for narrow methods.
- `.claude/agents/spec.md` — every spec needs a "fidelity vs. fork" risk line for tasks that approximate an external artifact (templates, schema mappings, prompts).
- `scripts/ship.sh` — `module` default is currently `agent-fleet`. Should be required (no default) so the PR is correctly tagged.
- `docs/AGENT_FLEET.md` — document the "I'm playing the worker" mode that proved useful when the worker CLIs were unauthed.

## Tier 3 — UX gaps from the original plan

### Structured-mode form editor (~1 module of work)
**Why now matters.** Module 5 ships JSON-in-Monaco as the structured surface. It works, but it's hostile to non-developers. The agent-plan envisioned a form-based editor (with zod validation) at "Module 7". We slipped it.

**Suggested scope:**
- `src/components/resume/ResumeForm.tsx` — controlled form bound to `useProjectStore`.
- Sections collapsible (Basics, Experience, Education, Projects, Skills, Awards).
- "Add" / "Remove" / "Reorder" controls per array section.
- Inline zod validation (no library yet — add `zod`).
- Replaces Monaco view in structured mode (or splits 50/50: form left, live `.tex` right).

### Better template thumbnails
**Why.** Picker is visually flat because we don't render PDFs ahead of time.

**Suggested approach.** Render each template against `sampleResume` once at build time, save a `templates/<id>.thumb.png` via Playwright + Sharp. Include the thumb in `TemplateRenderer` and show it in `TemplatePickerModal`.

### Apply-suggestion fuzzy match
**Why.** Currently exact-string. One whitespace change breaks Apply. The error message is helpful but the UX is brittle.

**Suggested approach.** Levenshtein distance with a 90% threshold. If a fuzzy match wins, show "Apply (fuzzy)?" so the user knows.

### Streaming for Monaco rewrite
**Why.** Single-line rewrites are fast but multi-line rewrites (future module) would benefit. Also makes the in-flight UX richer.

**Suggested approach.** Both Ollama and Gemini support SSE-style streaming. Add an optional `stream` callback to `LLMClient.complete`. Monaco `executeEdits` would need a stable range anchor that updates as text grows.

## Tier 4 — Features the user emphasized that are partially done

### Cloud sync (real implementation)
**Current state:** Module 9 ships interface + stub. Export/Import file flow is real and works.

**To complete:** Pick a backend (Supabase / PocketBase / self-hosted Postgres + Hono). Implement `CloudSyncClient` against it. The interface is narrow enough that the swap is contained — but auth flow (email + magic link is friendliest) is its own ~half-day.

### Form editor enables Module-12 cross-linking
The blog posts in Module 12 reference "use the JD Match" and "use Rewrite for impact". A future tweak: render those references as clickable affordances inside the post (e.g. `<button>Open JD Match</button>` that opens the assistant drawer to the JD tab). Trivial to add once we want it.

### PNG icons for PWA
**Why.** Safari prefers raster icons for the install card.

**Suggested approach.** Generate 192/512 PNG from `public/favicon.svg` (sharp or sharp-cli). Add to `manifest.icons[]`.

### Update toast for PWA
**Why.** `autoUpdate` swaps the SW silently. A "New version available, reload?" prompt is friendlier.

**Suggested approach.** Subscribe to `registerSW({ onNeedRefresh })` from `virtual:pwa-register`. Render a small toast component.

## Tier 5 — Module 12 + content vision

The user emphasized: "blog is product, not marketing." Module 12 ships three posts. The vision is broader:

### Content backlog (one post each, in priority order)
- **The XYZ formula** (Google's "Accomplished X, as measured by Y, by doing Z" — original summary + examples).
- **STAR vs. CAR storytelling for behavioural interviews** (already adjacent to resume polish).
- **Common ATS killers** (specific format mistakes that break parsers — multi-column PDFs without a fallback, image-based text, etc.).
- **Cover letter templates** (different category — would need a `CoverLetterData` + renderers).
- **One-page vs. two-page** decision tree.

### Content infrastructure improvements
- **Search across posts** — a small search input + naive substring match against `title + summary + body`.
- **Tag pages** — clicking a tag in a card shows all posts with that tag.
- **Reading progress indicator** — small bar at top of `LearnDrawer__post` showing scroll percentage.
- **Open in deep-link** — `?learn=harvard-ces` URL param that auto-opens the drawer to that post.

## Tier 6 — Modules not yet attempted

These weren't in the 0-12 plan but came up during build:

- **Module 13 — Cover letters**: a parallel structured-mode object alongside `resume.json`, plus a small set of cover letter templates. Could share the LLM client and AI rewrite plumbing.
- **Module 14 — Multi-resume**: today the store holds one `currentProject`. A `projects[]` list with switcher would unlock "tailored variant per company" workflows. Modest UI work; bigger persistence/migration story.
- **Module 15 — Browser extension companion**: a small extension that scrapes the JD from the active LinkedIn/Indeed/Greenhouse tab and sends it to Underleaf via window.postMessage. Solves the manual-paste friction.

## Tier 7 — Architecture follow-ups (no user-visible value, but worth tracking)

- **MonacoEditor split** — file is ~470 lines handling LaTeX + JSON. Split into `MonacoLatexEditor.tsx` + `MonacoJsonEditor.tsx`, with a thin gate component that picks one. Easier to test, easier to extend.
- **CSS token consolidation** — drawer/modal styles are repeated across `AssistantDrawer.css`, `LearnDrawer.css`, `BackupModal.css`, `TemplatePickerModal.css`. Extract `ul-drawer` and `ul-modal` shared rules.
- **Error boundaries** — none today. A top-level boundary in `App.tsx` would catch lazy-chunk load failures gracefully.
- **i18n** — every string is English. Once there's demand, lift to a flat `messages.en.ts` and wrap.

## How to use this backlog

When you come back, scan **Tier 1 + Tier 2** first. Tier 1 is a single 5-minute action (merge PR #16). Tier 2 is the "make the fleet smarter for next time" investment. After that, pick by appetite — the fleet workers are ready to take a spec for any Tier 3+ item if/when you re-enter architect mode.

## File map for the curious

If you want to know where something lives without grepping:

```
src/
├── engine/                # Module 2 — SwiftLaTeX wrapper, error parser
├── components/
│   ├── editor/            # MonacoEditor (LaTeX + JSON modes)
│   ├── preview/           # PDFPreview + ExportMenu
│   ├── sidebar/           # FileTree (the control surface for everything)
│   ├── ai/                # AssistantDrawer + 3 tab panels
│   ├── templates/         # TemplatePickerModal
│   ├── backup/            # BackupModal
│   ├── learn/             # LearnDrawer
│   ├── layout/            # EditorLayout (responsive 3-col / mobile tabs)
│   └── system/            # OfflineBadge
├── templates/             # Module 5/6 — 4 LaTeX renderers + registry + sampleResume
├── ai/                    # ATS hints + JD matcher + apply path + rewrite helper
├── llm/                   # Module 7 — LLMClient + Gemini + Ollama adapters
├── sync/                  # Module 9 — projectIo + CloudSyncClient interface
├── export/                # Module 10 — PDF / plain-text / JSON Resume
├── content/               # Module 12 — registry + 3 posts
├── hooks/                 # useCompileTrigger / useProjectPersistence / useOnlineStatus
├── persistence/           # localProject + llmSettings
├── store/                 # useProjectStore (Zustand) — the single source of truth
└── types/                 # project.ts + resume.ts
```
