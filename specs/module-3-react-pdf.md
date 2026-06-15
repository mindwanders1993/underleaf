# module-3-react-pdf — Real PDF preview via react-pdf

## Goal

When `compilationState.pdfBlobUrl` is non-null, the right pane renders the compiled PDF using `react-pdf`. The user can paginate (prev/next/jump), zoom (in/out/fit-width/100%), and see the page count. While the engine is warming up or compiling, the cold-start overlay from Module 2 still shows. On compilation error, the error list from Module 2 still shows. The transitions between states are seamless — no flicker.

## Acceptance criteria

- [ ] `src/components/preview/PDFPreview.tsx` mounts `<Document file={pdfBlobUrl}>` from `react-pdf` and renders the current page via `<Page>`.
- [ ] PDFPreview is loaded via `React.lazy` so it doesn't bloat the initial bundle.
- [ ] pdfjs worker is configured via Vite `?url` import (`pdfjs-dist/build/pdf.worker.min.mjs?url`), not a CDN.
- [ ] Page toolbar: prev / next buttons, current page input, total page count, zoom out / in / 100% / fit-width.
- [ ] Zoom range clamped to 0.25–4.0.
- [ ] Fit-width recomputes on container resize (ResizeObserver).
- [ ] When `pdfBlobUrl` changes, page resets to 1; zoom is preserved.
- [ ] `react-pdf` CSS for `AnnotationLayer` and `TextLayer` is imported once so text selection works.
- [ ] `PreviewPlaceholder` (gate) renders `<PDFPreview>` only when `status === 'SUCCESS'` and `pdfBlobUrl` is truthy. Cold-start/idle/error states are unchanged from Module 2.
- [ ] `npm run lint` clean.
- [ ] `npm run build` clean. Initial bundle does not regress >50% vs. Module 2 (228 KB → ≤340 KB; we accept some growth from `react-pdf` but the lazy split must work).
- [ ] Vitest suite for `PDFPreview.test.tsx` passes — mocks `react-pdf`, asserts page-nav state, zoom clamps, prop pass-through.

## Files to touch

- `src/components/preview/PDFPreview.tsx` — new. Real preview component (lazy-loaded inside its file).
- `src/components/preview/PDFPreview.css` — new. Toolbar + canvas wrapper styles.
- `src/components/preview/PreviewPlaceholder.tsx` — gate: keep cold-start/error/idle JSX from Module 2; render `<Suspense><LazyPDFPreview /></Suspense>` for success.
- `src/components/preview/pdfWorker.ts` — new. Side-effect module: sets `pdfjs.GlobalWorkerOptions.workerSrc`. Imported once at module top of `PDFPreview.tsx`.
- `src/components/preview/PDFPreview.test.tsx` — new.
- `docs/LLD.md` §2.4 — refresh to match implementation.

## Reuse first

- `src/store/useProjectStore.ts:97` — `setCompilationResult` already populates `pdfBlobUrl`; do not re-wire.
- `src/store/useProjectStore.ts` selectors used in `PreviewPlaceholder` already (status, pdfBlobUrl, errors); use the same selectors.
- `src/styles/variables.css` — colors, spacing tokens. No new tokens.
- `lucide-react` icons (already in deps) — `ChevronLeft`, `ChevronRight`, `ZoomIn`, `ZoomOut`, `Maximize2`.

## Test plan

- **Unit (Vitest)**: `PDFPreview.test.tsx`
  - Mock `react-pdf`'s `Document` and `Page` to render a `<div data-testid>` with passed `file` and `pageNumber`.
  - Mock the side-effect `pdfWorker` module.
  - Render with `file="blob:fake"`. Assert page 1 by default. Click next → page 2 (after `onLoadSuccess` simulates 5 pages). Click zoom-in → scale increments. Clamp at 4.0. Zoom-out clamps at 0.25.
  - Changing `file` prop resets `pageNumber` to 1, preserves `scale`.
- **Manual** (real browser):
  1. `npm install && npm run fetch:engine`
  2. `npm run dev`
  3. Cmd+Enter to compile (after engine warms up). PDF should render with toolbar; nav + zoom work.
  4. Edit the .tex, recompile, confirm preview updates.

## Risks / open questions

- **pdfjs worker version mismatch**: `react-pdf@10.4.1` pins a specific `pdfjs-dist`. The `?url` import must resolve to the same version `react-pdf` uses, else `Document` rejects with "API version does not match". Verify with `npm ls pdfjs-dist`.
- **Bundle size**: `react-pdf` + `pdfjs-dist` is ~300 KB. Lazy split is mandatory; without it main bundle balloons.
- **COEP and the worker**: the dev COOP/COEP headers from Module 2 may block the pdfjs worker if it's served without `Cross-Origin-Resource-Policy`. Vite serves local assets with correct CORP by default — verify in dev.
- **Print/text-layer rendering**: deferred; basic Page rendering is enough for Module 3.
