# Underleaf — Project Status

> Snapshot as of **2026-06-16**, end of the implementer-phase sprint.
> This is the master entry point for picking up the project. Start here.

## TL;DR

- **All 12 modules from the original roadmap are merged to `dev`.** End-to-end loop works: structured resume → template render → SwiftLaTeX WASM compile → react-pdf preview → AI assist → backup/export → PWA + offline → in-app blog.
- **One open PR (#16)** unblocks the first-run setup. Merge it before testing.
- **Test commands**, manual playbook, and known issues are in **[`TESTING.md`](./TESTING.md)**.
- **Backlog + roadmap** for what to do next is in **[`NEXT_STEPS.md`](./NEXT_STEPS.md)**.
- **Fleet refinement notes** (friction I hit while playing the implementer role this session, queued for the agent-fleet refinement PR) is in **[`FLEET_LEARNINGS.md`](./FLEET_LEARNINGS.md)**.

## Modules

| # | Module | State | PR |
|---|---|---|---|
| 0 | Scaffold (React 19 + Vite + Monaco + Zustand + 3-pane layout) | ✅ Merged | #3 |
| 1 | Agent fleet infrastructure (dispatcher, 7 workers, 4 skills) | ✅ Merged | #1 |
| 2 | SwiftLaTeX WASM compile loop + cold-start UI | ✅ Merged | #5 |
| 3 | `react-pdf` preview with toolbar (page nav, zoom, fit-width) | ✅ Merged | #6 |
| 4 | File sidebar (real CRUD) + localStorage persistence w/ 5 MB guard | ✅ Merged | #7 |
| 5 | Dual-mode `Project` + `ResumeData` schema + Jake's Resume renderer | ✅ Merged | #8 |
| 6 | Template gallery (4 templates) + picker modal | ✅ Merged | #9 |
| 7 | BYO LLM (Gemini + Ollama) + ATS hints + JD matching | ✅ Merged | #10 |
| 8 | Apply-suggestion + Monaco AI rewrite + structured JSON editor | ✅ Merged | #11 |
| 9 | Project export/import + cloud-sync stub | ✅ Merged | #12 |
| 10 | Export polish (PDF / ATS plain-text / JSON Resume) | ✅ Merged | #13 |
| 11 | PWA + offline (vite-plugin-pwa, WASM cache, offline badge) | ✅ Merged | #14 |
| 12 | In-app Learn drawer (Harvard CES / Stanford BEAM / AI cookbook) | ✅ Merged | #15 |
| — | **Unblock PR**: fetch-engine URL + COEP credentialless | 🟡 Open | **#16** |

## How to come back to this project

1. `git pull origin dev`
2. **Merge PR #16** (it makes the first-run actually work).
3. Open **[`TESTING.md`](./TESTING.md)** and follow the setup section.
4. The runtime behaviour you should see is documented module-by-module in **[`TESTING.md`](./TESTING.md)**'s walkthrough.

## Stack recap (so you don't have to re-read CLAUDE.md)

- **React 19.2** + **Vite 8** + **TypeScript ~6.0**
- **Monaco Editor** (LaTeX grammar + JSON mode for structured editing)
- **react-pdf 10.4** (lazy-loaded chunk)
- **SwiftLaTeX** WASM engine, vendored in `public/swiftlatex/` (gitignored, fetched via `npm run fetch:engine`)
- **Zustand 5** single store with project / compilation / editorSettings / uiState / authState / llmSettings slices
- **react-markdown** (lazy chunk for the Learn drawer)
- **vite-plugin-pwa** with Workbox precache + runtime cache for the engine
- **Vitest 4** (33 test files / 152 tests, jsdom env)
- **ESLint flat config** with React 19 lint rules
- BYO LLM: Gemini (`generativelanguage.googleapis.com/v1beta`) or local Ollama (`/api/chat`)

## Bundle size as of dev tip

- Main bundle: **~274 KB / 86 KB gzip**
- Lazy `PDFPreview` chunk: 423 KB / 125 KB gzip
- Lazy `LearnDrawer` chunk: 129 KB / 41 KB gzip
- pdf.worker: 1.04 MB
- SwiftLaTeX engine (vendored, cached in service worker): 1.8 MB

## Persistence keys

- `underleaf.project.v1` — full project payload (files + resume + mode + templateId)
- `underleaf.llm.v1` — provider settings + API key (intentionally separate from project)

## Source of truth for the agent fleet design

If/when you want to resume the architect-only mode where worker agents implement modules, the fleet is documented in **[`AGENT_FLEET.md`](./AGENT_FLEET.md)** and ready to drive. The unmerged learnings from the implementer phase live in **[`FLEET_LEARNINGS.md`](./FLEET_LEARNINGS.md)**.
