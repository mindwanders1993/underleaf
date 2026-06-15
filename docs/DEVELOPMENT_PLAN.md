# Development Plan - Underleaf

## Part 1: AI Model Strategy
To optimize token usage, reasoning capability, and speed, we will employ a multi-model strategy throughout development.

### Model Selection Matrix
| Task Type | Recommended Model | Rationale | Estimated Cost |
| :--- | :--- | :--- | :--- |
| **Architecture / Planning** | Claude 3.5 Sonnet / Opus | Highest reasoning capability, can hold massive context windows for whole-system design. | High (Cloud API) |
| **Complex Module Code Review**| Claude 3.5 Sonnet / Opus | Deep reasoning required to spot edge cases in WASM/Worker integration. | High (Cloud API) |
| **UI/CSS Code Generation** | Gemini Pro / Flash | Excellent at spitting out boilerplate React and CSS quickly based on strict patterns. | Medium (Cloud API) |
| **Utility / Simple Logic** | MiniMax M3 | Fast and capable for isolated functions (e.g., regex parsers, local storage wrappers). | Low (Cloud API) |
| **Git Commit Automation** | Ollama (qwen2.5-coder:3b / llama3.2:3b) | Lightning fast, runs locally, no cost. Perfect for summarizing `git diff`. | Zero (Local VRAM) |
| **Local Code Review** | Ollama (qwen2.5-coder:14b) | Strong reasoning for pre-commit sanity checks without sending code to the cloud. | Zero (Local VRAM) |

### Ollama Setup Guide
1. Install Ollama: `brew install ollama` (macOS)
2. Pull models: `ollama pull qwen2.5-coder:3b`
3. Git Hook Configuration: Create `.git/hooks/prepare-commit-msg` with a script that pipes `git diff --cached` to the local model.
```bash
#!/bin/bash
# .git/hooks/prepare-commit-msg
DIFF=$(git diff --cached)
if [ -n "$DIFF" ]; then
  MSG=$(ollama run qwen2.5-coder:3b "Write a concise Conventional Commit message for this diff: $DIFF")
  echo "$MSG" > $1
fi
```

### Workflow
1. **Design:** Architect designs the module using Claude (Opus/Sonnet).
2. **Implement:** Developer uses Gemini to blast out the component code.
3. **Commit:** Ollama generates the commit message locally.
4. **Review:** Claude reviews the PR against architecture guidelines before merge.

---

## Part 2: Git Branching & PR Strategy

### Branch Naming Conventions
- `feature/module-name` (e.g., `feature/monaco-integration`)
- `fix/issue-description` (e.g., `fix/wasm-memory-leak`)
- `docs/update-name` (e.g., `docs/add-api-spec`)
- `refactor/component` (e.g., `refactor/store-split`)

### Commit Format (Conventional Commits)
- `feat: integrate Monaco editor`
- `fix: resolve PDF.js worker path issue`
- `style: apply glassmorphism to sidebar`
- `chore: update dependencies`

### PR Workflow
1. All work branches from `dev`.
2. PR created targeting `dev` branch.
3. Requires 1 approval.
4. Squash and merge.
5. Periodic release from `dev` to `main` for production deployments.

---

## Part 3: Module-by-Module Development Plan

### Module 0: Project Scaffold (DONE)
- **Description:** React+Vite+TS setup, Zustand store, types, ESLint, Prettier.
- **Branch:** `main` (Initial commit)

### Module 1: Global CSS Design System
- **Description:** Establish CSS custom properties, fonts, glassmorphism mixins, responsive tokens.
- **Prerequisites:** Module 0
- **Branch:** `feature/design-system`
- **Files:** `src/styles/variables.css`, `src/styles/index.css`, `src/styles/glass.css`
- **AI Model:** Gemini Flash (CSS generation)
- **Acceptance Criteria:** A "Style Guide" component renders correctly with primary colors, typography, and glassmorphism cards.
- **Effort:** 4 hrs

### Module 2: Responsive Layout Shell
- **Description:** EditorLayout component with 3-panel layout, resize handles.
- **Prerequisites:** Module 1
- **Branch:** `feature/layout-shell`
- **Files:** `src/components/layout/EditorLayout.tsx`, `src/App.tsx`
- **AI Model:** Gemini Pro (React component logic)
- **Acceptance Criteria:** 3 panes are visible, resizable via drag handles. Collapses to tabs on mobile screens.
- **Effort:** 6 hrs

### Module 3: Monaco Editor Integration
- **Description:** Monaco wrapper, LaTeX Monarch tokenizer, autocomplete.
- **Prerequisites:** Module 2
- **Branch:** `feature/monaco-editor`
- **Files:** `src/components/editor/MonacoEditor.tsx`, `src/components/editor/latexGrammar.ts`
- **AI Model:** Claude (Complex AST/grammar definition)
- **Acceptance Criteria:** LaTeX syntax is highlighted correctly. Autocomplete suggests commands. Typing updates Zustand store.
- **Effort:** 8 hrs

### Module 4: SwiftLaTeX WASM Compiler
- **Description:** Web Worker setup, MemFS, compile pipeline state machine.
- **Prerequisites:** Module 0
- **Branch:** `feature/wasm-compiler`
- **Files:** `src/workers/compiler.worker.ts`, `src/services/CompilerService.ts`
- **AI Model:** Claude (Complex concurrency and WASM integration)
- **Acceptance Criteria:** Clicking compile sends state to worker, worker executes dummy logic or actual WASM if available, returns success/fail to store.
- **Effort:** 12 hrs

### Module 5: PDF Preview
- **Description:** react-pdf viewer, zoom/page controls.
- **Prerequisites:** Module 4
- **Branch:** `feature/pdf-preview`
- **Files:** `src/components/preview/PDFPreview.tsx`, `src/components/preview/ZoomControls.tsx`
- **AI Model:** Gemini Pro (React integration)
- **Acceptance Criteria:** PDF renders from Blob URL. Zoom in/out works. Page next/prev works.
- **Effort:** 6 hrs

### Module 6: File Manager & Storage
- **Description:** File tree sidebar, create/rename/delete, localStorage persistence.
- **Prerequisites:** Module 2
- **Branch:** `feature/file-manager`
- **Files:** `src/components/sidebar/FileTree.tsx`, `src/utils/storage.ts`
- **AI Model:** MiniMax M3 (Logic/Storage wrappers)
- **Acceptance Criteria:** Can create new files, switch between them in Monaco, and reload page to see files restored from localStorage.
- **Effort:** 8 hrs

### Module 7: Error Log Parser
- **Description:** LaTeX log parsing, structured errors, click-to-jump.
- **Prerequisites:** Module 4, Module 3
- **Branch:** `feature/error-parser`
- **Files:** `src/components/layout/ErrorLog.tsx`, `src/utils/parser.ts`
- **AI Model:** MiniMax M3 (Regex parsing logic)
- **Acceptance Criteria:** Raw LaTeX logs are converted to clean UI list. Clicking error focuses correct line in editor.
- **Effort:** 4 hrs

### Module 8: Template Gallery
- **Description:** Template registry, category grid, load-into-editor flow.
- **Prerequisites:** Module 6
- **Branch:** `feature/templates`
- **Files:** `src/components/sidebar/TemplateGallery.tsx`, `src/data/templates.json`
- **AI Model:** MiniMax M3 (Data generation)
- **Acceptance Criteria:** Clicking a template overwrites current project files in store.
- **Effort:** 4 hrs

### Module 9: Toolbar & Settings
- **Description:** Compile button animations, download PDF, settings modal, theme toggle.
- **Prerequisites:** Module 5
- **Branch:** `feature/toolbar`
- **Files:** `src/components/layout/Toolbar.tsx`, `src/components/shared/SettingsModal.tsx`
- **AI Model:** Gemini Flash (UI component)
- **Acceptance Criteria:** Toolbar controls state correctly. Dark/Light theme toggles correctly.
- **Effort:** 4 hrs

### Module 10: Landing Page
- **Description:** Hero section, feature highlights, template showcase.
- **Prerequisites:** Module 1
- **Branch:** `feature/landing-page`
- **Files:** `src/pages/LandingPage.tsx`
- **AI Model:** Gemini Pro (Aesthetics/UI)
- **Acceptance Criteria:** Premium, beautiful marketing page that routes to the editor.
- **Effort:** 6 hrs

### Module 11: Polish & Deploy
- **Description:** Performance optimization, Cloudflare Pages deployment.
- **Branch:** `feature/deployment`
- **Files:** `.github/workflows/deploy.yml`
- **AI Model:** Claude (DevOps/CI)
- **Acceptance Criteria:** Pushing to `main` deploys app automatically.
- **Effort:** 2 hrs

---

## Part 4: Sprint Planning

**Sprint 1: Foundation & Editor (2 weeks)**
- Modules 1, 2, 3, 6.
- Goal: User can open the app, see a beautiful layout, create files, edit them with syntax highlighting, and changes save locally.

**Sprint 2: Compilation & Preview (2 weeks)**
- Modules 4, 5, 7.
- Goal: User can compile their LaTeX code into a PDF locally, view the PDF, and debug compilation errors.

**Sprint 3: Polish & Launch (1 week)**
- Modules 8, 9, 10, 11.
- Goal: Templates exist, settings work, landing page is beautiful, app is deployed to Cloudflare.

---

## Part 5: Risk Register

1. **WASM Bundle Size**
   - *Risk:* SwiftLaTeX binary might be huge (>20MB), slowing initial load.
   - *Mitigation:* Heavy HTTP caching, Service Workers. Show a beautiful skeleton loading screen.
2. **Main Thread Blocking**
   - *Risk:* Compiling locks up UI.
   - *Mitigation:* Strict enforcement of Web Workers for Compiler and PDF renderer.
3. **localStorage Quota**
   - *Risk:* User hits 5MB limit with images.
   - *Mitigation:* Warn user at 4MB. Advise to use external image URLs or compress assets. Future R2 integration solves this.
