# module-6-template-gallery — Template gallery v1

## Goal

Give users a visible choice of resume templates. Add three more renderers (Deedy-style two-column, Awesome-CV-style with an accent color, RenderCV-style modern minimal) plus a picker modal that lists all templates, shows a description, marks the currently-selected one, and lets the user switch. From `raw` mode, picking a template flips the project into `structured` (seeding `sampleResume` if absent) — one click to "try a resume template".

Module 6 is **renderer + picker UI**. No template thumbnails yet (those need a real PDF render and are deferred). No template marketplace / sharing. Just a clean picker over the four shipped renderers.

## Acceptance criteria

- [ ] `src/templates/deedy-cv/index.ts` — two-column layout (sidebar 30 % for skills/education, main 70 % for experience/projects). Uses `geometry` + `minipage` + standard packages only.
- [ ] `src/templates/awesome-cv/index.ts` — single column with `xcolor`-driven accent color in name + section headers. Standard packages only.
- [ ] `src/templates/rendercv-modern/index.ts` — single column, parskip-style spacing, side dates, lowercase section headers.
- [ ] Each new renderer exposes `id`, `name`, `description`, `render(data)` returning `{ mainTex, files: [] }`, and is registered in `src/templates/index.ts`.
- [ ] Every renderer escapes all user content via `escapeLatex`.
- [ ] `src/components/templates/TemplatePickerModal.tsx` — modal with a grid of cards (one per registered template). Each card shows name + description, a "Use this template" button, and a "Selected" badge for the current `templateId`. Escape key or backdrop click closes it.
- [ ] `src/components/sidebar/FileTree.tsx` adds a "Browse templates" button to the footer (visible in both modes). Clicking opens the picker.
- [ ] Picking a template:
  - If `project.mode === 'raw'`: switch to `structured`, seed `sampleResume` if `resume` is absent, set `templateId`.
  - If `project.mode === 'structured'`: just call `setTemplate(id)`.
- [ ] Picker is keyboard-accessible: Tab cycles cards; Enter on a card activates it; Esc closes; focus returns to the trigger.
- [ ] `npm run lint`, `npm run build` clean. Main bundle growth ≤ 12 KB.
- [ ] Vitest covers: each new renderer (escape + section presence + sample data smoke test), picker modal (renders, activates template, escapes-to-close), sidebar wires the modal.

## Files to touch

- `src/templates/deedy-cv/index.ts` — new.
- `src/templates/deedy-cv/deedy-cv.test.ts` — new.
- `src/templates/awesome-cv/index.ts` — new.
- `src/templates/awesome-cv/awesome-cv.test.ts` — new.
- `src/templates/rendercv-modern/index.ts` — new.
- `src/templates/rendercv-modern/rendercv-modern.test.ts` — new.
- `src/templates/index.ts` — register the three new templates.
- `src/components/templates/TemplatePickerModal.tsx` — new.
- `src/components/templates/TemplatePickerModal.css` — new.
- `src/components/templates/TemplatePickerModal.test.tsx` — new.
- `src/components/sidebar/FileTree.tsx` — add "Browse templates" footer button + modal mount.
- `src/components/sidebar/FileTree.test.tsx` — extend with the picker open/close + template selection flow.
- `docs/LLD.md` §2.12 — list the four templates.

## Reuse first

- `src/templates/types.ts` — `TemplateRenderer` interface. No changes needed.
- `src/templates/escapeLatex.ts` — every renderer uses it.
- `src/templates/index.ts` — only the `TEMPLATES` record needs new entries; the API is stable.
- `src/templates/sampleResume.ts` — seed for first-time switch.
- `src/store/useProjectStore.ts` — `setProjectMode`, `setTemplate` already exist and handle the seed-on-switch path.
- Lucide icons already in deps: `LayoutGrid` for "Browse templates", `Check` for the selected badge, `X` for the modal close. (Verify before final write.)

## Test plan

- **Unit (Vitest)**:
  - Each `*-cv.test.ts`: renders the `sampleResume`, asserts presence of `\documentclass`, candidate name, every work company, project name. Renders a malicious payload, asserts escape correctness.
  - `TemplatePickerModal.test.tsx`: renders 4 cards; clicking a non-selected card calls a passed `onPick(id)`; Esc fires `onClose`; first card receives focus on open.
  - `FileTree.test.tsx`: "Browse templates" button opens modal; selecting a template in raw mode flips to structured + sets templateId; selecting in structured mode just updates templateId.
- **Manual** (until form editor lands): open app, click Browse templates, pick Deedy → "Switch to structured" auto-fires + Cmd+Enter compiles a Deedy-style PDF. Switch templates and recompile; layout changes.

## Risks / open questions

- **Template fidelity**: Deedy, Awesome-CV, RenderCV originals have intricate custom commands. Module 6 ships **simplified, dependency-free** approximations so that everything compiles under SwiftLaTeX without vendoring fonts/icons. The PR description must be explicit about this; the renderers are deliberately "v1 starters" with room to refine.
- **No thumbnail previews**: rendering a thumbnail requires actually compiling each template at picker-open time; defer until we have a server-side renderer or a cached static asset pipeline.
- **Focus management**: the modal must restore focus to the trigger after close. Use a ref + `useEffect`.
- **Bundle size**: each renderer adds a few KB. With four templates the bundle should still be well under the +12 KB budget.
