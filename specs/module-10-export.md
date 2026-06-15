# module-10-export — Export polish: PDF / ATS plain-text / JSON Resume

## Goal

Three one-click exports from the PDF preview toolbar:

1. **PDF** — download the compiled `pdfBlobUrl` (Module 2 output).
2. **ATS plain-text** — deterministic text dump of the structured `resume` for paste-into-ATS workflows.
3. **JSON Resume** — emit the resume in [jsonresume.org schema v1.0.0](https://jsonresume.org/schema/) form, so users can hand it to other tools.

Auto-disable buttons that can't run (PDF needs a compiled blob; structured exports need `resume`).

## Acceptance criteria

- [ ] `src/export/download.ts` — helper `triggerDownload(filename, blob | string)` (string is wrapped in a `text/plain` Blob).
- [ ] `src/export/plainText.ts` — `exportResumeAsPlainText(resume): string`. Deterministic: same input always produces byte-identical output. Includes basics line, summary, experience, projects, education, skills, awards (only sections with data).
- [ ] `src/export/jsonResume.ts` — `toJsonResume(resume): JsonResumeRoot`. Maps our schema: `work.company → work.name`, `education.degree+field → education.studyType+area`, our grouped skills → JSON Resume flat `[{name: category, keywords: items}]`.
- [ ] `src/export/types.ts` — `JsonResumeRoot` type (subset of jsonresume schema we actually emit).
- [ ] `src/components/preview/ExportMenu.tsx` — small "Download ▾" button in the PDFPreview toolbar that opens a menu with the three options. Esc closes; outside click closes.
- [ ] PDF download uses the current `compilationState.pdfBlobUrl`. Filename: `{projectId}.pdf`.
- [ ] Plain-text + JSON Resume buttons disabled when `project.mode !== 'structured'` or `resume` absent, with a tooltip explaining why.
- [ ] `npm run lint`, `npm run build` clean. Main bundle growth ≤ 6 KB.
- [ ] Vitest covers: plainText output stability (snapshot), edge cases (minimal resume, missing optional fields); jsonResume mapping (work company→name, skills regroup); download helper invokes anchor + revokes URL.

## Files to touch

- `src/export/download.ts` — new.
- `src/export/plainText.ts` — new.
- `src/export/plainText.test.ts` — new.
- `src/export/jsonResume.ts` — new.
- `src/export/jsonResume.test.ts` — new.
- `src/export/types.ts` — new.
- `src/components/preview/ExportMenu.tsx` — new.
- `src/components/preview/ExportMenu.css` — new.
- `src/components/preview/ExportMenu.test.tsx` — new.
- `src/components/preview/PDFPreview.tsx` — mount `ExportMenu` in the toolbar.
- `docs/LLD.md` — new §2.19 Export.

## Reuse first

- `src/store/useProjectStore.ts` for `currentProject` and `compilationState.pdfBlobUrl`.
- `src/types/resume.ts` for `ResumeData`.
- `src/components/preview/PDFPreview.css` already has the toolbar styles; reuse the button look.
- Lucide icons (`Download`, `ChevronDown`).

## Risks / open questions

- **PDF download is for the compiled `pdfBlobUrl`** — i.e. the *last successful compile*. If the user changed code since, they get the older PDF. We surface no warning today; future enhancement.
- **JSON Resume mapping is intentionally lossy** — JSON Resume has fields we don't model (location object, profiles, languages, interests, references); we omit rather than guess.
- **Plain text wraps at 72 cols?** No — we emit untruncated lines; clients can wrap. Aim is "machine-paste-friendly", not pretty.
