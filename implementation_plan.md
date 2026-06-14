# Underleaf — Application Design Document

> **Status**: Design Phase v1.0  
> **Goal**: Design a $0/month, open-source, fully browser-based LaTeX editor that anyone can use from any device.

---

## 1. Product Vision

**Underleaf** is a beautiful, fast, zero-cost LaTeX editor that runs entirely in the browser. No server, no monthly bills, no sign-up required. Everything compiles locally using WebAssembly — your LaTeX source never leaves your device.

### Design Principles
- 🆓 **$0/month to run** — pure static hosting, WASM compilation
- 🔒 **Privacy-first** — source code never sent to any server
- 📱 **Any device** — mobile, tablet, desktop, all first-class
- ⚡ **Instant start** — no account required, open and write
- 🎨 **Bold & beautiful** — not another boring developer tool

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                        │
│                                                         │
│  ┌──────────┐    ┌─────────────┐    ┌────────────────┐  │
│  │  Monaco  │    │  SwiftLaTeX │    │    PDF.js      │  │
│  │  Editor  │───▶│  WASM Engine│───▶│   Viewer       │  │
│  │ (LaTeX)  │    │ (pdfTeX/XeTeX)   │  (Preview)     │  │
│  └──────────┘    └─────────────┘    └────────────────┘  │
│        │                                    │            │
│        └──────── localStorage ─────────────┘            │
│                  (projects, files)                       │
└─────────────────────────────────────────────────────────┘
          │                              │
          ▼                              ▼
   Cloudflare Pages              Cloudflare R2 (optional)
   (Static hosting)              (Cloud save for logged-in users)
         FREE                         ~$0.015/GB
```

### Why $0/month is possible
| Component | Solution | Cost |
|-----------|---------|------|
| Frontend hosting | Cloudflare Pages | **Free** (unlimited bandwidth) |
| LaTeX compilation | SwiftLaTeX WASM (in browser) | **Free** (user's CPU) |
| Project storage | Browser localStorage | **Free** |
| Auth (optional) | Cloudflare Workers + GitHub OAuth | **Free** (100k req/day) |
| Cloud save (optional) | Cloudflare R2 | **~$0** for small usage |
| Domain | Cloudflare (custom domain) | **Free** on CF Pages |

**Total: $0/month** (or ~$0.50/month if cloud save is heavily used)

---

## 3. User Flows

### Flow 1: Anonymous User (No login)
```
Landing Page
    │
    ├─▶ "Start Writing" → New blank project → Editor
    │
    ├─▶ "Use Template" → Template gallery → Editor (pre-filled)
    │
    └─▶ "Upload .tex file" → Editor (with uploaded file)
                                    │
                                    ├─▶ Edit → Compile → Preview PDF
                                    ├─▶ Download PDF
                                    └─▶ Projects saved in browser
```

### Flow 2: Logged-in User (GitHub/Google OAuth)
```
Landing Page
    │
    └─▶ "Sign in" → OAuth → Dashboard
                              │
                              ├─▶ My Projects (cloud-synced)
                              ├─▶ Create / Open / Delete projects
                              └─▶ Editor (same as anonymous, + auto-sync)
```

---

## 4. Screen Architecture

### 4.1 Landing Page
- Full-screen hero with animated LaTeX → PDF transformation demo
- "Start Writing" CTA (no signup needed)
- Feature highlights: 0 cost, private, fast, any device
- Template showcase gallery
- "Sign in to save projects to cloud" soft prompt

### 4.2 Dashboard (logged-in only)
- Grid of project cards with thumbnail previews
- Recent projects, starred projects
- Search / filter
- Create new project button

### 4.3 Editor (Core Screen)
**Desktop Layout** — 3 columns:
```
┌──────────┬────────────────────────┬──────────────────┐
│ Sidebar  │     Monaco Editor      │   PDF Preview    │
│          │                        │                  │
│ Files    │  \documentclass{...}   │  [PDF rendered]  │
│ ─────    │  \begin{document}      │                  │
│ main.tex │  Hello World           │  Page 1 of 3     │
│ refs.bib │  \end{document}        │  [zoom controls] │
│ fig1.png │                        │                  │
│          │                        │                  │
│ ─────    ├────────────────────────┤                  │
│ [Upload] │  Error Log (collapsed) │                  │
└──────────┴────────────────────────┴──────────────────┘
           [Toolbar: Compile | Download | Settings | Share]
```

**Tablet Layout** — 2 columns + drawer:
```
┌────────────────────────┬──────────────────┐
│     Monaco Editor      │   PDF Preview    │
│                        │                  │
│                        │                  │
├────────────────────────┴──────────────────┤
│  [Files drawer slides in from left]       │
│  [Toolbar at top]                         │
└───────────────────────────────────────────┘
```

**Mobile Layout** — Single panel with tab switcher:
```
┌──────────────────────────────┐
│  [Toolbar]                   │
├──────────────────────────────┤
│                              │
│   [Active panel content]     │
│   (Editor / Preview / Files) │
│                              │
├──────────────────────────────┤
│  [✏️ Edit] [📄 PDF] [📁 Files] │
└──────────────────────────────┘
```

---

## 5. Visual Identity

### Brand Name
**Underleaf** — compile LaTeX resumes locally on your device.

### Color System
```
Dark Mode (default):
  Background:     #0A0E1A  (deep space navy)
  Surface:        #111827  (card/panel background)
  Surface2:       #1C2333  (elevated surface)
  Border:         #2D3748  (subtle divider)
  
  Accent Primary: #6EE7B7  (mint green — compile button, active states)
  Accent Alt:     #818CF8  (soft indigo — links, secondary actions)
  Danger:         #F87171  (error states)
  Warning:        #FBBF24  (warnings in log)
  
  Text Primary:   #F1F5F9  (main text)
  Text Secondary: #94A3B8  (labels, hints)
  Text Muted:     #475569  (placeholders)

Light Mode:
  Background:     #F8FAFC
  Surface:        #FFFFFF
  Accent Primary: #059669  (darker mint for contrast)
  Text Primary:   #0F172A
```

### Typography
```
Display / Hero:  "Space Grotesk" — geometric, modern, bold
UI / Body:       "Inter" — clean, highly readable
Code / Editor:   "JetBrains Mono" — best-in-class monospace
```

### Design Language
- **Glassmorphism** toolbar: `backdrop-filter: blur(12px)` with subtle border
- **Gradient accents**: mint → indigo gradients on key CTAs
- **Smooth transitions**: 200ms ease on all hover/active states
- **Floating panels**: subtle box-shadows, rounded corners (12px)
- **Micro-animations**: compile button pulses while processing
- **Particle/beam effect** on landing page hero (CSS-only)

---

## 6. Component Map

### Core Components
| Component | Description |
|-----------|------------|
| `<LandingPage>` | Hero, features, templates, auth prompt |
| `<Dashboard>` | Project grid, search, create/delete |
| `<EditorLayout>` | Responsive split-pane orchestrator |
| `<FileTree>` | Sidebar with project files |
| `<MonacoEditor>` | VS Code-quality editor + LaTeX lang |
| `<PDFPreview>` | PDF.js viewer with page/zoom controls |
| `<Toolbar>` | Compile, download, settings, share |
| `<ErrorLog>` | Collapsible compiler output panel |
| `<TemplateGallery>` | Browse and load starter templates |
| `<ThemeToggle>` | Dark ↔ Light mode switcher |
| `<UserMenu>` | Auth state, sign in/out, profile |

### State Management
```
Global State (Zustand):
  - currentProject: { id, name, files[], mainFile }
  - compilationState: { status, pdfBlob, logs, errors }
  - editorSettings: { theme, fontSize, autoCompile }
  - uiState: { activePanel, sidebarOpen, logOpen }
  - authState: { user, isLoggedIn }
```

---

## 7. Key Feature Designs

### 7.1 LaTeX Editor (Monaco)
- Language: custom `latex` Monarch token provider
- Syntax colors: commands (`\`) in mint, environments in indigo, comments in muted
- Autocomplete: 200+ LaTeX commands triggered by `\`
- Snippets: `\begin` auto-completes matching `\end`
- Line numbers, code folding, bracket matching
- Minimap disabled on mobile

### 7.2 Compilation UX
```
States:
  IDLE        → "Compile" button (mint, keyboard shortcut shown)
  COMPILING   → Button shows spinner + "Compiling..." + pulsing animation
  SUCCESS     → PDF updates smoothly, button returns to idle (1s green flash)
  ERROR       → Error log panel auto-expands, button shows red X
```

- `Ctrl+Enter` / `Cmd+Enter` triggers compile
- Optional **Auto-compile**: debounced 2s after last keystroke
- First compile warning: "First compile may take 30s to load the TeX engine"

### 7.3 Error Log
- Parses tectonic/pdfTeX output into structured errors
- Each error shows: line number (clickable → jumps to line), message, file
- Color coded: 🔴 Error, 🟡 Warning, 🔵 Info
- Collapsible panel at the bottom of the editor

### 7.4 Templates
Built-in v1 templates:
| Template | Description |
|----------|------------|
| 📄 Blank | Empty document skeleton |
| 👤 Resume / CV | Professional single-page CV |
| 📚 Academic Article | IEEE/ACM-style paper |
| 📊 Beamer Slides | Presentation with modern theme |
| 📝 Cover Letter | Job application letter |

### 7.5 Project Storage
```
Anonymous User:
  - Projects stored in localStorage as JSON
  - Max ~5MB (browser limit)
  - "Export project" → .zip download
  - Warning shown when approaching limit

Logged-in User (v2):
  - Projects synced to Cloudflare R2
  - No size limit for reasonable use
  - Auto-sync on every compile
```

---

## 8. Tech Stack (Design Decision)

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend Framework | **React 18 + Vite** | Fast builds, excellent ecosystem |
| Editor | **Monaco Editor** (`@monaco-editor/react`) | VS Code quality |
| PDF Viewer | **react-pdf** (PDF.js) | Browser-native, no server |
| LaTeX Engine | **SwiftLaTeX** (WASM pdfTeX) | Runs in browser, zero server cost |
| State | **Zustand** | Lightweight, no boilerplate |
| Styling | **Vanilla CSS + CSS Custom Properties** | Full control, no bloat |
| Fonts | **Google Fonts** (Inter, Space Grotesk, JetBrains Mono) | Free, beautiful |
| Auth (v2) | **Cloudflare Workers + GitHub OAuth** | Free tier, edge-fast |
| Storage (v2) | **Cloudflare R2** | Near-zero cost object storage |
| Hosting | **Cloudflare Pages** | Free, unlimited bandwidth, global CDN |
| CI/CD | **GitHub Actions → CF Pages** | Auto-deploy on push, free |

---

## 9. Hosting Architecture ($0/month)

```
GitHub Repo
    │ (git push)
    ▼
GitHub Actions
    │ (npm run build)
    ▼
Cloudflare Pages ──────▶ Users worldwide (CDN edge)
(free static hosting)     Mobile / Tablet / Desktop

Optional (v2, still near-$0):
Cloudflare Workers ──▶ Auth (GitHub OAuth)
Cloudflare R2      ──▶ Project cloud storage (~$0.01/GB/mo)
Cloudflare D1      ──▶ User/project metadata (SQLite at edge, free)
```

---

## 10. Phased Roadmap

### Phase 1 — Core Editor (Design → Build)
- Landing page + hero
- Monaco editor with LaTeX syntax
- SwiftLaTeX WASM compilation
- PDF preview
- Error log
- File upload/manage
- Download PDF
- Templates
- Dark/Light mode
- Responsive (mobile + tablet + desktop)
- Anonymous projects in localStorage
- Deploy to Cloudflare Pages

### Phase 2 — Cloud & Auth
- GitHub / Google OAuth
- Project cloud sync (Cloudflare R2)
- Project sharing (read-only links)
- Collaboration invite

### Phase 3 — Power Features
- Real-time collaboration (Yjs + WebRTC)
- Git integration (push/pull from GitHub)
- AI LaTeX assistant (client-side, API key provided by user)
- Custom TeX Live package support

---

## 11. Open Questions for User

1. **Logo style**: Minimalist wordmark, or icon-based (e.g., a custom Underleaf logo)?
2. **Templates**: Which specific templates matter most for v1?
3. **Domain**: Will you purchase a custom domain, or use `.pages.dev` for free?
