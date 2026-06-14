---
name: ul-validate
description: Run codebase validation checks, including linting, TypeScript compilation, and production build verification.
trigger: /ul-validate
---

# Skill: /ul-validate

Verify the integrity of the codebase. Run this check before finishing any feature or bug fix, and before recommending PR merge details.

## When to invoke
- When a user asks you to validate, check, test, or verify the codebase.
- As a final step before completing a task that modifies `.tsx`, `.ts`, `.js`, or `.css` files.

## Steps

### 1. Run Linter and Formatters
Check the code formatting and check for static analysis errors.
```bash
npm run lint
```
If errors are reported:
- Auto-fix minor issues with `npm run lint -- --fix` (if ESLint supports it).
- If formatting is off, run Prettier: `npm run format`.
- Manually resolve any remaining ESLint/TypeScript warnings.

### 2. Run TypeScript Compilation (Type check)
Vite does not perform type checking during development, so run this to ensure no type errors leak.
```bash
npx tsc --noEmit
```
All type errors must be fixed before proceeding.

### 3. Run Production Build
Ensure that the bundler can successfully compile and optimize all assets (including CSS custom properties, Monaco workers, and PDF.js workers).
```bash
npm run build
```
Verify the console output has `0` errors.

### 4. Check WASM Asset Integrations (Simulation/Verification)
If changes touch files under `src/wasm/` or relate to the SwiftLaTeX compiler:
- Verify that `swiftlatex` package imports resolve correctly.
- Verify that standard LaTeX packages (like `article.cls`, `geometry.sty`) are either bundled or mapped to correct URLs.

## Pre-flight Checklist

Before concluding:
- [ ] No ESLint errors
- [ ] `tsc --noEmit` runs with zero errors
- [ ] `npm run build` compiles with zero errors
- [ ] Changed files match the styling and architecture guidelines in `CLAUDE.md` and `GEMINI.md`.
