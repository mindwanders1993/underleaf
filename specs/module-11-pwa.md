# module-11-pwa — Progressive Web App + offline

## Goal

Make Underleaf installable and runnable offline. After the first online compile (which warms the WASM engine), the user should be able to disconnect and keep editing/compiling on the same machine. Add a tiny floating "Offline" badge so the user can see network state.

## Acceptance criteria

- [ ] `vite-plugin-pwa` configured in `vite.config.ts` with `registerType: 'autoUpdate'` and Workbox precaching of `js,css,html,svg,png,ico,wasm,mjs,woff,woff2` plus runtime caching for `/swiftlatex/*` (cache-first, separate cache, 1-year max-age).
- [ ] `public/manifest.webmanifest` not needed (plugin generates) — config supplies: `name=Underleaf`, `short_name=Underleaf`, `description`, `theme_color=#6EE7B7`, `background_color=#0A0E1A`, `display=standalone`, icons referencing `/favicon.svg`.
- [ ] `src/hooks/useOnlineStatus.ts` — subscribes to `online`/`offline` window events, returns boolean.
- [ ] `src/components/system/OfflineBadge.tsx` — floats bottom-right when offline; renders nothing when online.
- [ ] `OfflineBadge` mounted in `App.tsx` once.
- [ ] `npm run build` produces `dist/sw.js` and a `dist/manifest.webmanifest`.
- [ ] `npm run lint`, `npm run build` clean. Main bundle growth ≤ 2 KB (SW lives in its own chunk).
- [ ] Vitest covers: `useOnlineStatus` reflects `navigator.onLine` and updates on `online`/`offline` events; `OfflineBadge` returns null online, renders content offline.

## Files to touch

- `package.json` — add `vite-plugin-pwa` devDep.
- `vite.config.ts` — register the plugin.
- `src/hooks/useOnlineStatus.ts` — new.
- `src/hooks/useOnlineStatus.test.ts` — new.
- `src/components/system/OfflineBadge.tsx` — new.
- `src/components/system/OfflineBadge.css` — new.
- `src/components/system/OfflineBadge.test.tsx` — new.
- `src/App.tsx` — mount `OfflineBadge`.
- `docs/LLD.md` — new §2.20 PWA.

## Reuse first

- `public/favicon.svg` already exists; plugin icons reference it.
- No new lucide icons needed; OfflineBadge uses text + dot.

## Risks / open questions

- **WASM engine caching**: the engine files live in `public/swiftlatex/` (gitignored, vendored at install). Workbox precaches everything under `dist/` so the engine ends up cached once the user runs `npm run fetch:engine` before build. In the live dev/production case, the runtime cache rule for `/swiftlatex/*` is the durable handler.
- **PNG icons**: PWA spec wants 192/512 PNG for best UX. We declare the SVG only — works in Chrome/Edge, less ideal in Safari. Future small task to add PNG variants.
- **Update flow**: `autoUpdate` swaps the SW silently. No update toast in v1; future module.
- **Test env**: jsdom doesn't fire `navigator.onLine` correctly; we set it via `Object.defineProperty` in tests.
