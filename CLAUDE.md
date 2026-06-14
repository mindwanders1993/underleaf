# CLAUDE.md — Underleaf

> Read this file at the start of every session. It contains everything needed to build, maintain, and extend the Underleaf project.

---

## Working Agreement (Karpathy Skills)

These four rules apply to every task in this project. They are not suggestions.

### 1. Think before coding
Surface assumptions before acting. If a task is ambiguous — layout choice, component structure, Monaco editor options, WASM configuration — ask. Don't hide confusion behind a plausible-looking result. Present tradeoffs when the right approach is genuinely unclear.

> **For this project:** State changes in Zustand, Monaco config, and SwiftLaTeX engine events are highly load-bearing. A minor misconfiguration in the WASM compiler loop or worker files will silently break LaTeX compilation or hang the preview screen. A 10-second check prevents broken commits.

### 2. Simplicity first
Write the minimum code that satisfies the request. No speculative features, no premature abstractions. If three lines repeat, that's fine — don't abstract until it's genuinely needed.

> **For this project:** Keep UI components as simple, focused React files using Vanilla CSS. Do not introduce tailwind or complex CSS-in-JS libraries. Avoid wrapping the Monaco React wrapper or `react-pdf` in overcomplicated layers. Keep state minimal in Zustand.

### 3. Surgical changes
Touch only the files the task requires. Don't "improve" adjacent code, comments, or formatting while in there. If you notice something broken nearby, flag it in chat — don't silently fix it.

> **For this project:** The compile/preview loop has a strict data flow: Editor state -> Compile trigger -> SwiftLaTeX WASM engine -> PDF Blob -> PDF.js viewer. Unsolicited modifications in shared components can disrupt this state flow. Keep changes local.

### 4. Goal-driven execution
Define what "done" looks like before starting. For any change: done means all linters pass, the Vite build succeeds with zero errors (`npm run build`), and the editor can compile and render a test document.

---

## Git Workflow — MANDATORY, No Exceptions

### Branch rules
- **Every fix, feature, or chore gets its own new branch**, created from `dev`.
- **Never reuse a merged branch.** Even if the branch still exists, create a fresh one.
- **Branch naming:**
  - `fix/<short-description>` — bug fixes
  - `feat/<short-description>` — new features or UI changes
  - `chore/<short-description>` — docs, config, housekeeping

```bash
# Always branch from dev
git checkout dev
git pull origin dev
git checkout -b feat/your-description
```

### Commit and push
- Make changes, verify build passes, then commit and push.
- Commit message format: `type(scope): short description` — e.g. `feat(editor): add ctrl+enter compilation shortcut`

```bash
git add <specific files>
git commit -m "feat(editor): add ctrl+enter compilation shortcut"
git push -u origin feat/your-description
```

### PR rules — CRITICAL
- **You (AI) NEVER raise a PR. You NEVER merge a PR.**
- Share the PR details in this format so the owner can create it via GitHub UI:

```
PR: `feat/your-description` → `dev`
Title: feat(editor): add ctrl+enter compilation shortcut
Description: <what changed and why>
```

- Feature/fix/chore branches always target **`dev`**, never `main`.

---

## Commands

```bash
# Dev server
npm run dev          # Start local Vite server (default: localhost:5173)

# Build & Preview
npm run build        # Build production bundles (CSS/JS minified)
npm run preview      # Preview the production build locally

# Lint & Format
npm run lint         # Check codebase for lint errors (ESlint / TypeScript)
npm run lint -- --fix # Auto-fix lint issues where possible
npm run format       # Format codebase using Prettier
```

---

## Skills (Invocable with `/`)

Project-scoped skills live in `.claude/skills/` (and `.gemini/skills/`). Invoke by typing the skill name.

| Skill | Purpose |
|---|---|
| `/ul-validate` | Validate project code by running linter, type checks, and full build. |
| `/ul-add-component` | Scaffold a new responsive React component following the design system. |
| `/ul-new-template` | Scaffold and register a new LaTeX template in the gallery. |
| `/graphify` | Update or query the knowledge graph (global skill). |

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| **Framework** | React 18 + Vite | Fast builds, excellent state sync and component ecosystem |
| **Editor** | Monaco Editor (`@monaco-editor/react`) | VS Code-quality code editing, bracket matching, autocomplete |
| **PDF Viewer** | `react-pdf` (PDF.js) | Native browser PDF rendering without server dependencies |
| **LaTeX Engine** | SwiftLaTeX (WASM pdfTeX/XeTeX) | Runs entirely in user's browser, zero server costs |
| **State** | Zustand | Simple, lightweight global store, zero boilerplate |
| **Styling** | Vanilla CSS + Custom Properties | Maximum flexibility, zero performance overhead, pure design token control |
| **Fonts** | Google Fonts | Space Grotesk (Display/Hero), Inter (UI), JetBrains Mono (Code) |

---

## Design System & Tokens

### Colors (Defined in `src/styles/index.css`)
```css
/* Dark Mode (default) */
--color-bg: #0A0E1A;              /* Deep space navy */
--color-surface: #111827;         /* Cards/Panels */
--color-surface2: #1C2333;        /* Active/Elevated panels */
--color-border: #2D3748;          /* Subtly contrasting dividers */

--color-accent-primary: #6EE7B7;  /* Mint green (Compile button, active states) */
--color-accent-alt: #818CF8;      /* Soft indigo (Links, secondary CTAs) */
--color-danger: #F87171;          /* Error notifications/logs */
--color-warning: #FBBF24;         /* Warning items */

--color-text-primary: #F1F5F9;    /* Title and main body text */
--color-text-secondary: #94A3B8;  /* Labels, descriptors, and subtext */
--color-text-muted: #475569;      /* Placeholders */

/* Light Mode (applied via [data-theme="light"] on html) */
--color-bg: #F8FAFC;
--color-surface: #FFFFFF;
--color-surface2: #F1F5F9;
--color-border: #E2E8F0;
--color-text-primary: #0F172A;
--color-text-secondary: #475569;
--color-accent-primary: #059669;  /* Darker mint for proper accessibility */
```

### Typography
- Headings: `font-family: 'Space Grotesk', sans-serif;`
- Body & UI: `font-family: 'Inter', sans-serif;`
- Code / Monaco: `font-family: 'JetBrains Mono', monospace;`

### Responsive Layout Layout Breakpoints
- **Desktop (≥1024px)**: 3-column split view `[Sidebar/Files | Monaco Editor | PDF Preview]`.
- **Tablet (768px - 1024px)**: 2-column view `[Monaco Editor | PDF Preview]` with sliding file drawer.
- **Mobile (<768px)**: Tabbed single-panel navigation (`[✏️ Edit]` / `[📄 PDF]` / `[📁 Files]` tabs at the bottom).

---

## Code Invariants & Key Gotchas

1. **WASM Cold Start**: The first LaTeX compilation triggers loading of SwiftLaTeX WASM engine (approx. 2-5MB). Inform the user via UI popup/spinner that first compile takes up to 30 seconds.
2. **State Management**: All file system operations (create/rename/delete files) and compile statuses must sync with global Zustand store (`currentProject`, `compilationState`).
3. **Monaco Worker**: Ensure Vite resolves Monaco worker files correctly in development and production builds.
4. **LocalStorage Storage Limit**: The JSON payload for anonymous projects must not exceed 5MB. Implement warning when projects consume >80% of capacity.
