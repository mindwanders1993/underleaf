# Underleaf — Testing Playbook

This doc gets you from a fresh checkout to a fully-exercised app, including the BYO-LLM path on a local Ollama install (no API key, no cost). Walk through it once and you've verified every module.

## 0. Prereqs

- Node 22+ (whatever your project lockfile expects)
- `gh` CLI authenticated for working with the open PRs
- Optional: Ollama 0.30+ (`brew install ollama` on macOS, then `ollama serve`)

## 1. First-run setup

```bash
git checkout dev
git pull origin dev

# Merge open unblock PR first — without it npm run fetch:engine 404s
# and the COEP headers block local Ollama / Gemini fetches.
gh pr merge 16 --squash   # or merge from the GitHub UI

git pull origin dev

npm install               # picks up vite-plugin-pwa + react-markdown + all
npm run fetch:engine      # ~1.8 MB vendored into public/swiftlatex/
```

Verify the engine landed:

```bash
ls -lh public/swiftlatex/
# Expected:
#   PdfTeXEngine.js          ~12 KB
#   swiftlatexpdftex.js      ~83 KB
#   swiftlatexpdftex.wasm    ~1.7 MB
```

## 2. Sanity checks (no UI)

```bash
npm run test     # 152/152 should pass
npm run lint     # clean (1 pre-existing warning in scripts/dispatch.mjs OK)
npm run build    # generates dist/sw.js (PWA) + main + lazy chunks
```

If `npm run test` is red, the most common cause is a leftover `localStorage` shim — re-run; jsdom warns but still passes.

## 3. Dev server

```bash
npm run dev      # http://localhost:5173
```

Use `dev` for iteration. Use `npm run build && npm run preview` (→ `http://localhost:4173`) when you want to test the **service worker / PWA / offline** behaviour — `dev` mode does **not** register the SW.

## 4. Ollama setup (free local LLM)

```bash
# In another terminal
ollama serve

# In yet another terminal — pull at least one model with good JSON discipline
ollama pull qwen2.5-coder:7b      # ~4.7 GB, best JSON discipline for JD matcher
ollama pull llama3.1:8b           # ~4.9 GB, good for single-line rewrites

# Quick smoke test
curl -s http://localhost:11434/api/chat \
  -d '{"model":"qwen2.5-coder:7b","stream":false,"messages":[
        {"role":"system","content":"Reply ONLY with valid JSON."},
        {"role":"user","content":"Return {\"ok\":true}."}]}' \
  | python3 -c "import sys,json;print(json.loads(sys.stdin.read())['message']['content'])"
```

You should see `{"ok": true}`. If that works, Underleaf will work.

## 5. Module-by-module manual walkthrough

Open the dev URL and run through these in order. Each row maps to a module.

### Module 2 — Compile loop

1. Watch the editor load. The default project has `main.tex` + `refs.bib`.
2. Hit **Cmd/Ctrl + Enter**.
3. **Expected:** A "Preparing LaTeX engine…" overlay appears (cold start, ~10–30 s). After it's gone, status becomes `SUCCESS` (you can see this in React DevTools or by the preview rendering in Module 3).
4. Hit Cmd+Enter again — subsequent compiles are sub-second.

If the cold-start hangs, check:
- `public/swiftlatex/` has the 3 files.
- DevTools → Console for `crossOriginIsolated` errors. PR #16 fixes this via COEP `credentialless`.

### Module 3 — PDF preview

1. After Module 2 succeeds the PDF should already be visible.
2. Try the toolbar: prev/next page, page input, zoom in/out/reset, fit-width (`Maximize` icon).
3. Cmd+Enter again with changed content — preview updates.

### Module 4 — File CRUD + persistence

1. Click `+` in sidebar header → type `intro.tex` → Enter. The file appears.
2. Right-click any row → Rename. Type a new name → Enter.
3. Right-click any row → Delete → confirm.
4. **Refresh the page.** Your changes survive.
5. Sidebar footer shows the storage meter (`underleaf.project.v1`). Add a long content and watch the bar grow.

### Module 5 — Dual mode + resume data

1. Sidebar footer → **"Switch to structured"**.
2. The editor swaps to a `resume.json` view (JSON syntax highlighting, the file label changes to `resume.json`).
3. Cmd+Enter. The PDF now renders using **Jake's Resume (simplified)** template populated from `sampleResume`.
4. Click **"Eject to raw .tex"** — sidebar footer toggles. The structured JSON is rendered into a single `main.tex` file you can edit directly.

### Module 6 — Template gallery

1. Sidebar footer → **"Browse templates"**. A modal lists 4 templates (Jake's, Deedy, Awesome-CV, RenderCV Modern).
2. Pick **Deedy** → modal closes → if you weren't in structured mode, it auto-switches you.
3. Cmd+Enter → PDF redraws with two-column layout.
4. Try the others. Each produces visibly different output.

### Module 7 — BYO LLM + ATS hints + JD matching

1. Sidebar footer → **"AI Assist"** → opens drawer with 3 tabs.
2. Go to **Settings** tab:
   - Provider: pick **Local Ollama**.
   - Model: type `qwen2.5-coder:7b` (or pick from the suggestions).
   - Ollama host: leave as `http://localhost:11434`.
   - Click **"Test connection"** — should reply with a sanity message.
3. Click **ATS Hints** tab — instant heuristic checks (no LLM needed).
4. Click **JD Match** tab → paste any real job description → click **Analyze**.
5. Expected: a score (0-100), gaps list, and suggested rewrites.

**Troubleshooting:**
- "Test connection failed: Ollama HTTP …": `ollama serve` isn't running, or the model isn't pulled.
- "LLM did not return valid JSON": the model returned text outside JSON. Try **qwen2.5-coder:7b** (best JSON discipline). llama3.1:8b also works.
- If you see a CORS or COEP error in DevTools console: PR #16 isn't merged.

### Module 8 — Apply suggestion + Monaco AI rewrite

1. In JD Match results, click **Apply** on any suggestion.
2. **Expected:** The Monaco `resume.json` view updates live. The corresponding `highlights[]` entry now contains the rewrite.
3. Cmd+Enter → PDF reflects the change.
4. Now switch to **raw mode** (Eject from structured if needed). Select a single bullet line in the editor.
5. Press **Cmd/Ctrl + Alt + R** (or right-click → "Underleaf: Rewrite for impact").
6. **Expected:** The header status shows "rewriting…" briefly. The line is replaced.

### Module 9 — Backup / sync stub

1. Sidebar footer → **"Backup & sync"** → modal opens.
2. Click **Export** → a `.json` file downloads (named `<projectId>-<date>.json`).
3. Open Chrome incognito → load `http://localhost:5173` → modal → **Import** → pick the file.
4. **Expected:** The imported project loads.
5. The "Connect cloud (coming soon)" button is intentionally disabled.

### Module 10 — Export polish

1. In the PDF toolbar (top of the preview pane), click **"Download ▾"** → dropdown shows three options.
2. **PDF** → downloads the compiled PDF.
3. **ATS plain-text** → deterministic text dump for ATS paste.
4. **JSON Resume** → validates against [jsonresume.org schema v1.0.0](https://jsonresume.org/schema/).
5. If you're in raw mode (no `resume`), the structured exports are disabled with hint text.

### Module 11 — PWA + offline

This module's behaviour requires the **production build**, not dev mode:

```bash
npm run build && npm run preview  # http://localhost:4173
```

1. Open `http://localhost:4173`.
2. DevTools → Application → Service Workers → confirm `sw.js` is **activated**.
3. DevTools → Application → Manifest → see name "Underleaf", theme `#6EE7B7`.
4. DevTools → Network tab → toggle **Offline**.
5. Reload the page.
6. **Expected:** The app still loads. The offline badge appears bottom-right.
7. Edit a file, Cmd+Enter — **expected:** compile still works (engine is cached).

### Module 12 — Learn drawer

1. Sidebar footer → **"Learn"**.
2. Drawer slides in with 3 posts (Harvard CES, Stanford BEAM, AI prompt cookbook).
3. Click any card → markdown renders.
4. Click the source link → opens in a new tab (`target="_blank"`).
5. Click **All posts** → back to list.
6. Esc closes the drawer.

## 6. End-to-end loop test

Verifies that all 12 modules cooperate:

1. Open the Learn drawer → read the **AI prompt cookbook** post for the "15-minute polish pass" workflow.
2. Sidebar footer → AI Assist → Settings → wire up Ollama (qwen2.5-coder:7b).
3. Switch to **structured** mode.
4. Browse templates → pick **Awesome-CV**.
5. Cmd+Enter → see the PDF.
6. AI Assist → ATS Hints — fix anything red.
7. AI Assist → JD Match → paste any job description → Analyze.
8. Apply 2–3 suggestions.
9. Cmd+Enter — PDF reflects the rewrites.
10. PDF toolbar → Download → PDF + ATS plain-text + JSON Resume.
11. Backup & sync → Export the whole project.
12. (Optional) `npm run build && npm run preview` → toggle offline → confirm it still works.

If all 12 steps work, the entire stack is functional.

## 7. Known issues / setup gotchas

| Issue | Cause | Fix |
|---|---|---|
| `npm run fetch:engine` returns HTTP 404 | TeXlyre fork moved the artifacts | **PR #16** repoints to `https://www.swiftlatex.com/` |
| Local Ollama / Gemini fetch fails with CORS/COEP error | COEP `require-corp` blocked cross-origin without CORP | **PR #16** switches to COEP `credentialless` |
| ATS plain-text export has weird spacing | Deterministic but un-prettified | By design — clients can wrap. Snapshot-tested. |
| Structured-mode editor is JSON-only | Form editor is future work | See `NEXT_STEPS.md` |
| Apply suggestion error "Original bullet not found" | Resume edited since last Analyze | Re-run Analyze |
| Ollama replies with non-JSON | Model didn't follow JSON discipline | Use `qwen2.5-coder:7b`; fallback `llama3.1:8b` |
| Cold compile takes 30+ s on slower machines | First-time WASM load | Subsequent compiles are sub-second. Cached by service worker after first build/preview. |
| Safari PWA install icon doesn't show right | We declared SVG icons only | Future: add 192/512 PNG icons |

## 8. If you need to nuke and restart

```bash
# Wipe persisted project data
# In browser DevTools console:
localStorage.clear()

# Wipe cached engine (force re-fetch)
rm -rf public/swiftlatex/*.{js,wasm}
npm run fetch:engine

# Wipe service worker cache
# DevTools → Application → Storage → Clear site data
```
