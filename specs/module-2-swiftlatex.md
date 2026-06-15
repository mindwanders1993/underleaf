# module-2-swiftlatex — SwiftLaTeX WASM engine integration

## Goal

When the user hits Ctrl/Cmd+Enter in the editor (already wired in `MonacoEditor.tsx`), the SwiftLaTeX WASM engine compiles the current project's `mainFile` (plus all sibling files) inside the browser and emits a PDF `Blob`. The PDF's object URL lands in `compilationState.pdfBlobUrl` via `setCompilationResult`. Logs and parsed errors land in the same call. The user sees a cold-start UI on the first compile and a result (or error overlay) within a few seconds on subsequent compiles.

Zero server. Zero account. Pure local.

## Acceptance criteria

- [ ] `src/engine/index.ts` exports `getLatexEngine()` returning a cached singleton that conforms to a typed `LatexEngine` interface.
- [ ] `src/engine/swiftLatexEngine.ts` implements `LatexEngine` by lazy-loading `/swiftlatex/PdfTeXEngine.js` at first compile.
- [ ] On `compilationState.status` transition to `COMPILING`, a `useCompileTrigger` hook calls the engine, writes every project file into the engine's MemFS, compiles `mainFile`, builds a `Blob` URL, and dispatches `setCompilationResult`.
- [ ] Engine compile errors are parsed into `CompileError[]` (line, message, severity) before dispatch.
- [ ] Existing `compilationState.pdfBlobUrl` is `URL.revokeObjectURL`-ed before a new URL replaces it (no memory leak).
- [ ] `PreviewPlaceholder` (until Module 3 replaces it) shows a "Preparing LaTeX engine — first compile takes ~30 seconds" overlay while the engine is warming up.
- [ ] `scripts/fetch-swiftlatex.mjs` downloads the engine artifacts into `public/swiftlatex/`; `npm run fetch:engine` is wired.
- [ ] `public/swiftlatex/README.md` documents the required files and where they come from.
- [ ] `npm run lint` clean.
- [ ] `npm run build` clean (TypeScript strict, no `@ts-ignore`).
- [ ] Vitest suite for `src/engine/swiftLatexEngine.test.ts` passes — mocks the underlying engine, asserts file write order, error parsing, blob URL emission, URL revocation.

## Files to touch

- `src/engine/index.ts` — new. `LatexEngine` interface + `getLatexEngine()` singleton factory.
- `src/engine/swiftLatexEngine.ts` — new. Adapter over the SwiftLaTeX `PdfTeXEngine`.
- `src/engine/errorParser.ts` — new. pdfTeX log → `CompileError[]`.
- `src/engine/types.ts` — new. `LatexEngineInit`, `LatexCompileInput`, `LatexCompileResult`.
- `src/hooks/useCompileTrigger.ts` — new. Subscribes to store, drives engine.
- `src/App.tsx` — mount `useCompileTrigger()`.
- `src/components/preview/PreviewPlaceholder.tsx` — add cold-start + error overlay derived from store.
- `public/swiftlatex/README.md` — new. Vendor instructions.
- `public/swiftlatex/.gitkeep` — new (so the directory exists empty in the repo).
- `scripts/fetch-swiftlatex.mjs` — new. Node script: download engine files into `public/swiftlatex/`.
- `package.json` — add `vitest` devDep + `fetch:engine`, `test` scripts.
- `vite.config.ts` — ensure `optimizeDeps.exclude` covers the dynamic `/swiftlatex/PdfTeXEngine.js` (it's a public asset, not an import — usually nothing needed; verify).
- `docs/LLD.md` — add a "Compile pipeline" subsection diagramming editor → store → engine → store → preview.
- `src/engine/swiftLatexEngine.test.ts` — new. Vitest unit test with mocked engine.

## Reuse first

- `src/store/useProjectStore.ts:97` — `setCompilationResult(pdfBlobUrl, logs, errors)` is the only state-mutation entry point.
- `src/store/useProjectStore.ts:209` — `setCompileStatus` is what `MonacoEditor` already calls on Ctrl+Enter; do not duplicate that wiring.
- `src/store/useProjectStore.ts:113` — `compilationState.pdfBlobUrl` is the slot.
- `src/types/project.ts:14-29` — `CompileStatus`, `CompileError`, `CompilationState` are authoritative; do not add new types here.
- `src/components/editor/MonacoEditor.tsx:328-330` — the `Cmd+Enter → setCompileStatus('COMPILING')` shortcut is already in place. Compile trigger must react to that, not to a new event.

## Test plan

- **Unit (Vitest)**: `src/engine/swiftLatexEngine.test.ts`
  - Mock `PdfTeXEngine` from `/swiftlatex/PdfTeXEngine.js` via `vi.mock` of a module wrapper.
  - Assert `writeMemFSFile` called once per project file in order.
  - Assert `setEngineMainFile` called with `mainFile`.
  - Assert success path: returns `LatexCompileResult` with non-empty `pdfBuffer`; old object URL is revoked when a second compile runs.
  - Assert error path: returned `errors[].line` + `severity` derived from a fixture log.
- **Manual** (cannot run in CI without browser + WASM):
  1. `npm install`
  2. `npm run fetch:engine`
  3. `npm run dev` → open http://localhost:5173
  4. Wait for cold-start overlay; click compile (Cmd/Ctrl+Enter)
  5. PDF Blob URL should appear in `compilationState.pdfBlobUrl` (verify in React DevTools); preview still shows the placeholder until Module 3 wires `react-pdf`.

## Risks / open questions

- **Vendor source**: TeXlyre fork (`github.com/TeXlyre/swiftlatex`) is the active 2025–2026 maintainer per Module 1 risk note. If their release assets aren't directly downloadable, fetch script falls back to the BusyTeX or `SwiftLaTeX/SwiftLaTeX` original. Document whichever works in `public/swiftlatex/README.md`.
- **Cross-origin isolation**: SwiftLaTeX's `pdftex.bundle` may need `SharedArrayBuffer`, which requires `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers. If so, set them via `vite.config.ts` `server.headers` in dev and document a deployment caveat. Defer fixing if cold-start works without them.
- **CI doesn't run WASM**: end-to-end compile cannot be tested headlessly without a heavy Playwright + WASM rig. Vitest covers the abstraction with mocks; live verification is manual until we add a Playwright integration in a later module.
- **Engine warm time**: first compile is ~30s per CLAUDE.md. The cold-start overlay must remain visible from `engine.loadEngine()` start until the first compile completes; don't gate it solely on `status === 'COMPILING'`.
