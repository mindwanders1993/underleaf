# module-7-jd-matching — ATS hints + JD matching with BYO LLM

## Goal

Make Underleaf earn its "resume builder" label. Add an **AI Assistant** drawer with three tabs:

1. **ATS Hints** — instant, heuristic checks against the current `resume` (no LLM call).
2. **JD Match** — paste a job description, hit Analyze, the chosen LLM returns a score plus prioritized gaps and rewrite suggestions for specific bullets.
3. **Settings** — pick a provider (Google Gemini, local Ollama), enter API key / host, pick a model.

The LLM is **BYO** — the user supplies their own credentials. Nothing leaves the browser except the explicit call to the user's chosen endpoint. No proxy server.

Module 7 covers ATS hints + JD analysis + settings. **Module 8** ships the apply-suggestion-back-into-resume path and inline rewrite actions in Monaco.

## Acceptance criteria

- [ ] `src/llm/types.ts` exports `LLMClient` with one method: `complete({ system, user, model }): Promise<{ text, raw }>`.
- [ ] `src/llm/gemini.ts` implements `LLMClient` against `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` (browser-callable, supports CORS).
- [ ] `src/llm/ollama.ts` implements `LLMClient` against `${host}/api/chat` (default host `http://localhost:11434`).
- [ ] `src/llm/index.ts` exports `getLLMClient(settings)` factory plus `LLM_PROVIDERS` registry (with display name + supported models).
- [ ] Settings live in their own localStorage key (`underleaf.llm.v1`), not the project payload. `src/persistence/llmSettings.ts` exposes `load()/save()`.
- [ ] `useProjectStore` gains a `llmSettings` slice (`{ provider, model, apiKey?, ollamaHost? }`) + `setLlmSettings(patch)` action. Hydrated on first render via a new effect in `App.tsx` (alongside project persistence).
- [ ] `src/ai/atsHints.ts` exports `runAtsHints(resume)` returning `AtsHint[]` (`{ id, severity, title, detail }`). No LLM. Covers: missing summary, work bullets without metrics, weak action verbs, missing skills section, top-bullets-too-long, contact-info gaps.
- [ ] `src/ai/jdMatcher.ts` exports `analyzeJobDescription(resume, jd, client)` returning `{ score, gaps: string[], suggestions: { bullet, rewrite, reason }[], raw }`. Prompts the LLM with a strict JSON-only system message and parses the JSON response. Tolerates trailing code fences.
- [ ] `src/components/ai/AssistantDrawer.tsx` is a right-side slide-in panel (similar surface area to a modal but anchored). Three tabs at top. Esc closes; backdrop click closes; focus returns to trigger.
- [ ] `AtsHintsPanel` renders the result of `runAtsHints` with severity-coded icons. Refreshes when `resume` changes.
- [ ] `JdMatchPanel` has a textarea for the JD, an Analyze button (disabled if LLM not configured), a status while in flight, and a result section that renders the analysis on success. Errors show the message inline.
- [ ] `LlmSettingsPanel` lets the user pick a provider, enter API key, type a custom model id; "Save" persists via `setLlmSettings`; a "Test connection" button calls `complete({ user: 'ping' })`.
- [ ] FileTree footer adds an "AI Assist" button that opens the drawer.
- [ ] Drawer/panels are gated to projects in structured mode that have a `resume` (the only mode where the AI features make sense). In raw mode, the drawer shows a friendly stub explaining the gap.
- [ ] `npm run lint`, `npm run build` clean. Main bundle growth ≤ 20 KB.
- [ ] Vitest covers: each adapter (mocked `fetch`), ATS heuristic edge cases, JD matcher parsing (well-formed JSON, fenced JSON, partial JSON, network error), settings store action, drawer + panel interactions.

## Files to touch

- `src/llm/types.ts` — new.
- `src/llm/gemini.ts` — new.
- `src/llm/gemini.test.ts` — new.
- `src/llm/ollama.ts` — new.
- `src/llm/ollama.test.ts` — new.
- `src/llm/index.ts` — new (factory + registry).
- `src/persistence/llmSettings.ts` — new.
- `src/persistence/llmSettings.test.ts` — new.
- `src/store/useProjectStore.ts` — add llmSettings slice + setLlmSettings.
- `src/store/useProjectStore.test.ts` — extend with llmSettings test.
- `src/ai/atsHints.ts` — new.
- `src/ai/atsHints.test.ts` — new.
- `src/ai/jdMatcher.ts` — new.
- `src/ai/jdMatcher.test.ts` — new.
- `src/components/ai/AssistantDrawer.tsx` — new.
- `src/components/ai/AssistantDrawer.css` — new.
- `src/components/ai/AtsHintsPanel.tsx` — new.
- `src/components/ai/JdMatchPanel.tsx` — new.
- `src/components/ai/LlmSettingsPanel.tsx` — new.
- `src/components/ai/AssistantDrawer.test.tsx` — new.
- `src/components/sidebar/FileTree.tsx` — "AI Assist" footer button + drawer mount.
- `src/components/sidebar/FileTree.test.tsx` — extend with drawer open/close.
- `src/App.tsx` — hydrate LLM settings on mount.
- `docs/LLD.md` — new §2.15 LLM client, §2.16 AI Assistant.

## Reuse first

- `src/store/useProjectStore.ts` already has the slice pattern + persistence hook — model the LLM slice exactly the same way.
- `src/persistence/localProject.ts` is the template for `llmSettings.ts` (keyed save/load + guard for missing storage).
- `src/templates/escapeLatex.ts` — no escape needed for JSON prompts; mention only as reminder.
- `lucide-react` icons: `Sparkles` for AI button, `Settings`, `FileSearch` for JD tab, `ListChecks` for ATS tab. (Verify before write.)

## Test plan

- **Unit (Vitest)**:
  - `gemini.test.ts` — mocks `fetch` returning a `candidates[0].content.parts[0].text` payload; asserts URL contains the model + key; asserts thrown error on non-2xx.
  - `ollama.test.ts` — mocks `fetch` returning `{ message: { content: '...' } }`; defaults to `http://localhost:11434`; asserts proper body.
  - `atsHints.test.ts` — empty resume yields severity-1 hints; resume with no metrics in bullets gets a "quantification" hint; resume with strong verbs + metrics passes.
  - `jdMatcher.test.ts` — parses well-formed JSON; tolerates ```json fences; surfaces JSON parse errors with the raw text; rejects LLM errors.
  - `llmSettings.test.ts` — load/save round trip.
  - `useProjectStore.test.ts` (extend) — `setLlmSettings` merges patch; default provider is "gemini".
  - `AssistantDrawer.test.tsx` — opens/closes; tab switching; ATS panel renders hints; JD panel disables Analyze without LLM config; Settings panel saves and reads back.
  - `FileTree.test.tsx` (extend) — AI Assist button opens drawer.
- **Manual**: Configure Gemini key in Settings; switch to structured mode; paste a real JD; click Analyze; verify the score + suggestions render (free Google AI Studio key is enough). Then point at a local Ollama (`http://localhost:11434`) running `qwen3` and rerun.

## Risks / open questions

- **Browser CORS for Gemini**: Google's AI API supports browser CORS for `key=`-auth requests; document the limitation that OAuth flow is out of scope.
- **API key exposure**: Storing keys in localStorage is the standard pattern for BYO-model browser apps. We surface this in the Settings panel with a one-line warning. No telemetry, no proxy server, no Underleaf backend.
- **Model output discipline**: JD analysis must return strict JSON. The system prompt explicitly requests JSON-only with no commentary; the parser tolerates ```json``` fences and an optional leading sentence (we strip until first `{`).
- **Cost runaway**: a careless user could fire many Analyze calls in a row. The button locks during in-flight requests; we do not add rate limiting beyond that for v1.
- **Streaming**: deferred. v1 is await-then-render. Module 8 adds streaming for the rewrite path.
- **No OpenAI / OpenRouter adapter in v1**: deferred. Adding one is ~50 lines once the abstraction is in place.
- **AI features are structured-mode-only**: the drawer in raw mode shows a stub "switch to structured to use AI features" — the spec is explicit about this gate.
