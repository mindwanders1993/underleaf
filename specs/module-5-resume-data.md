# module-5-resume-data — Dual-mode `Project` (`raw` | `structured`) with template renderer

## Goal

Lay the data foundation that turns Underleaf into a **resume builder**, not just a LaTeX editor. Two project modes:

- **`raw`**: existing behavior. `project.files[]` are authored directly. Untouched in this module.
- **`structured`**: `project.resume: ResumeData` + `project.templateId` drive compilation. A `TemplateRenderer` converts the JSON into a `mainTex` (plus any extra files) which the engine compiles. The user can **eject** to raw at any time — render once, dump the output into `project.files[]`, flip mode, never look back.

Module 5 ships the schema, the renderer interface, one baseline template (Jake's Resume — simplified), a sample fixture, the four new store actions, and the compile-trigger plumbing. **No new UI for structured editing** — that's Module 7. The architect-facing surface for Module 5 is store actions; a tiny "Switch to structured / Eject to raw" toggle in the sidebar footer is the only visible change.

## Acceptance criteria

- [ ] `src/types/resume.ts` exports a typed `ResumeData` schema covering: `basics`, `work[]`, `education[]`, `projects[]`, `skills[]`, optional `awards[]`. All fields are validated by TypeScript only (no zod yet).
- [ ] `src/templates/escapeLatex.ts` exports `escapeLatex(input: string): string` that handles `\`, `&`, `%`, `$`, `#`, `_`, `^`, `{`, `}`, `~`.
- [ ] `src/templates/jakes-resume/index.ts` exports a `TemplateRenderer` with `id: 'jakes-resume'` and a `render(data)` that produces a self-contained `main.tex` that compiles under SwiftLaTeX (Module 2) — uses standard `\documentclass{article}` + commonly available packages only.
- [ ] `src/templates/index.ts` exports `TEMPLATES` (Record<id, TemplateRenderer>) and `getTemplate(id)`.
- [ ] `src/types/project.ts` extends `Project` with `mode: 'raw' | 'structured'`, optional `resume: ResumeData`, optional `templateId: string`. **`mode` defaults to `'raw'`** when absent (back-compat for already-saved projects).
- [ ] `src/store/useProjectStore.ts` adds: `setProjectMode(mode)`, `updateResume(patch: Partial<ResumeData>)`, `setTemplate(id)`, `ejectToRaw()`. `ejectToRaw` renders the current resume via the current template, replaces `files[]`, sets `mainFile = 'main.tex'`, sets `mode = 'raw'`, and clears `resume` + `templateId`.
- [ ] `src/persistence/localProject.ts` normalizes loaded projects (`mode ??= 'raw'`).
- [ ] `src/hooks/useCompileTrigger.ts` selects rendered files when `project.mode === 'structured'` and a template is set; otherwise uses `project.files`. mainFile passed to the engine is `'main.tex'` in structured mode.
- [ ] FileTree footer adds a single toggle button: "Switch to structured" (raw → structured: seeds resume from `sampleResume` if absent, sets `templateId = 'jakes-resume'`) and "Eject to raw .tex" (structured → raw).
- [ ] All previous tests still pass; new vitest suites cover escape edge cases, renderer output (smoke + escape integration), store actions (mode switch, eject round-trip), persistence migration, compile-trigger structured path (mocked engine).
- [ ] `npm run lint`, `npm run build` clean. Main bundle growth ≤ 8 KB.

## Files to touch

- `src/types/resume.ts` — new.
- `src/types/project.ts` — extend `Project`.
- `src/templates/escapeLatex.ts` — new.
- `src/templates/escapeLatex.test.ts` — new.
- `src/templates/index.ts` — new. Registry + `TemplateRenderer` interface re-export.
- `src/templates/types.ts` — new. `TemplateRenderer`, `TemplateRenderedFiles`.
- `src/templates/jakes-resume/index.ts` — new. Renderer.
- `src/templates/jakes-resume/jakes-resume.test.ts` — new.
- `src/templates/sampleResume.ts` — new. A short default fixture.
- `src/store/useProjectStore.ts` — add the four new actions; do **not** touch existing ones.
- `src/store/useProjectStore.test.ts` — new. Covers new actions + back-compat default.
- `src/persistence/localProject.ts` — normalize loaded `mode`.
- `src/persistence/localProject.test.ts` — extend.
- `src/hooks/useCompileTrigger.ts` — branch on mode.
- `src/hooks/useCompileTrigger.test.ts` — new.
- `src/components/sidebar/FileTree.tsx` — add the toggle button in the footer.
- `src/components/sidebar/FileTree.test.tsx` — extend with the toggle.
- `docs/LLD.md` — new §2.11 ResumeData + §2.12 TemplateRenderer.

## Reuse first

- `src/types/project.ts` already defines `ProjectFile`. Renderer output files use the same `ProjectFile` shape — do not re-declare.
- `src/hooks/useCompileTrigger.ts` already drives the engine in raw mode. Wrap the existing path, do not duplicate it.
- `src/persistence/localProject.ts` already returns parsed JSON; migration is a single line — do not add a versioning framework.
- Lucide icons (`FileText`, `Wrench`) are already in deps for the toggle button.

## Test plan

- **Unit (Vitest)**:
  - `escapeLatex.test.ts` — round-trip every special char; preserves whitespace; bidirectional safe (`escape(x) !== x` only when x contains specials).
  - `jakes-resume.test.ts` — `render(sampleResume)` returns a `main.tex` that contains the candidate name (escaped), every work company, every project name. `render({...})` with malicious chars yields properly escaped output.
  - `useProjectStore.test.ts` — `setProjectMode('structured')` flips mode; `updateResume({ basics: { name: 'X' } })` merges; `setTemplate('jakes-resume')` sets id; `ejectToRaw()` runs the renderer and replaces `files` + flips mode + clears resume.
  - `localProject.test.ts` (extend) — loading a JSON that lacks `mode` returns `mode: 'raw'`.
  - `useCompileTrigger.test.ts` — when `mode === 'structured'`, mocked engine receives rendered files; when `mode === 'raw'`, engine receives `project.files`.
  - `FileTree.test.tsx` (extend) — Switch-to-structured seeds resume + template; Eject-to-raw round-trips.
- **Manual** (full path arrives after Module 7's form editor): in dev tools console, set mode to structured via `useProjectStore.setState(...)`, hit Cmd+Enter, verify compile succeeds.

## Risks / open questions

- **Jake's Resume fidelity**: the original uses some custom command definitions. Module 5 ships a simplified, dependency-free version that still produces a clean ATS-friendly resume. Module 6 (template gallery) can add fidelity variants (`jakes-classic`, `jakes-modern`).
- **Editor in structured mode**: with no form UI yet, the Monaco editor will display whatever's in `mainFile` — possibly empty/stale. We accept this for one module; Module 7 ships the form view.
- **ejectToRaw is one-way**: by design. There's no "un-eject". This matches the architect plan.
- **Persistence size with `resume` field**: tiny JSON, well under the 5 MB cap. No new size handling needed.
- **No zod**: validation is type-level only. If users hand-edit invalid `resume` JSON, the renderer will produce broken `.tex`. Acceptable for now; add zod when Module 7 introduces a form parser.
