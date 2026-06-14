# GEMINI.md

Foundational mandates and project context for Gemini CLI in this repository.

**Working agreements, git workflows, commands, edge cases, design tokens, and project skills live in [`CLAUDE.md`](CLAUDE.md)** — they apply identically to Gemini work. This file holds only Gemini-specific guidance.

## Core mandates (one-liner each)

- **Architecture**: Single Page App (SPA) built using React 18 and Vite.
- **LaTeX Engine**: Client-side WASM (SwiftLaTeX) executing pdfTeX/XeTeX inside browser thread or Web Worker.
- **State**: Global state orchestrated via Zustand. Avoid nesting store updates; write pure state mutators.
- **Storage**: Anonymous users read/write from browser `localStorage` (max 5MB limit).
- **Styling**: Pure CSS Custom Properties (CSS variables) + Vanilla CSS. Never install or import Tailwind CSS.
- **Visuals**: Maintain high-fidelity glassmorphism aesthetics, gradient accents, and responsive layout breakpoints defined in [`CLAUDE.md`](CLAUDE.md).

## Gemini-specific context optimization

To stay efficient in Gemini CLI:

1. **Targeted reads** — when using `view_file`, always pass `StartLine` and `EndLine` if only a specific component, state mutator, or CSS block is needed. Do not dump 1000-line files into context.
2. **Conservative searches** — when using `grep_search`, set tight file extension scopes (e.g. `*.css` or `*.tsx`) to avoid reading build logs or binary assets.
3. **Memory offloading** — keep this `GEMINI.md` lean. Store workflows, bug notes, and temporary mental models in `.gemini/tmp/underleaf/memory/MEMORY.md`, not in chat or this file.
4. **Sub-agent delegation** — use `research` or `self` sub-agents for wide exploratory tasks to compress history.

## Graphify

Shared AST knowledge graph at `graphify-out/`.

Rules:
- ALWAYS read `graphify-out/GRAPH_REPORT.md` before reading any source files, running grep/glob searches, or answering codebase questions.
- IF `graphify-out/wiki/index.md` EXISTS, navigate it instead of reading raw files.
- After modifying code, run `npx graphify update .` or equivalent update hook to keep the graph current (AST-only, no API cost).

## Project skills

User-invocable workflows in `.gemini/skills/` — use `activate_skill` (or slash command if supported) to trigger. Same skills as the Claude side (`ul-validate`, `ul-add-component`, `ul-new-template`); see [`CLAUDE.md`](CLAUDE.md) table for descriptions.

## Token monitoring

For per-session/per-day Gemini CLI usage, check `/Users/mrrobot/.gemini/antigravity-cli/` logs.
