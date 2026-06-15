# public/swiftlatex/

This directory holds the **vendored SwiftLaTeX PdfTeX engine**. The files are NOT committed to git — they're downloaded on demand via `npm run fetch:engine` (≈ 8 MB total) and gitignored.

## Required files

| File | Purpose |
|------|---------|
| `PdfTeXEngine.js` | Public engine wrapper (sets `window.PdfTeXEngine`). |
| `swiftlatexpdftex.js` | Emscripten glue. |
| `swiftlatexpdftex.wasm` | The pdfTeX WASM binary. |
| `swiftlatexpdftex.worker.js` | Web Worker used by the engine. |

## Default source

`https://raw.githubusercontent.com/TeXlyre/swiftlatex/main/PdfTeXEngine/*`

If TeXlyre rearranges their tree, set `SWIFTLATEX_BASE_URL` before running the script:

```bash
SWIFTLATEX_BASE_URL="https://raw.githubusercontent.com/SwiftLaTeX/SwiftLaTeX/master/PdfTeXEngine" \
  npm run fetch:engine
```

## How it loads at runtime

`src/engine/swiftLatexEngine.ts` injects `<script src="/swiftlatex/PdfTeXEngine.js">` on first compile. The engine then loads the WASM worker from the same directory.

## Refreshing

```bash
npm run fetch:engine -- --force
```
