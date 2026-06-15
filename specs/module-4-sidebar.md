# module-4-sidebar — Real file tree + localStorage persistence

## Goal

Replace `SidebarPlaceholder` with a real file browser. Users can: see every project file with a type icon, click a `.tex` file to make it the `mainFile`, create new files inline, rename via double-click or context menu, delete with confirmation. The whole project (files + mainFile + name + id) survives page refresh via localStorage. A capacity meter shows payload size; when projected size crosses 80% of the 5 MB localStorage budget the meter turns warning-orange and surfaces a non-blocking banner. Above 100% the save is skipped (last good copy stays).

## Acceptance criteria

- [ ] `src/components/sidebar/FileTree.tsx` lists every `currentProject.files[]` entry with a lucide icon mapped from `ProjectFile.type` (tex/bib/image/other).
- [ ] Click a `.tex` row → `mainFile` becomes that file; row gets `data-active` + accent border.
- [ ] Inline "New file" button at the top opens a row with an `<input>` + type dropdown (tex/bib/other); Enter creates via `createFile`; Esc cancels; duplicate name shows inline error.
- [ ] Right-click (or kebab button) opens a context menu: Rename, Delete.
- [ ] Rename: enters inline edit; Enter commits via `renameFile`; Esc cancels.
- [ ] Delete: native `confirm()` prompt; confirms route through `deleteFile`. mainFile is reassigned automatically (already handled in the store).
- [ ] `src/persistence/localProject.ts` exports `loadProject()` and `saveProject(project)` keyed on `underleaf.project.v1`.
- [ ] `src/hooks/useProjectPersistence.ts` mounts in `App.tsx`: loads on first paint; saves on every `currentProject` change with a 300 ms debounce. Save is a no-op if `project` is null.
- [ ] Persistence exposes `usagePercent` (0–100+) via a small `useProjectSizeUsage()` selector; FileTree footer renders a capacity bar + label.
- [ ] When `usagePercent > 80`, FileTree shows a non-blocking warning row ("Project nearing localStorage limit").
- [ ] When a save would push past 100 %, `saveProject` returns `{ saved: false, reason: 'over-quota' }` and a console warning fires; previous payload stays intact.
- [ ] `npm run lint` clean.
- [ ] `npm run build` clean. Main bundle does not grow more than 10 KB.
- [ ] Vitest covers: file selection, create, rename, delete, persistence round-trip, size-warning thresholds, over-quota guard.

## Files to touch

- `src/components/sidebar/FileTree.tsx` — new.
- `src/components/sidebar/FileTree.css` — new.
- `src/components/sidebar/SidebarPlaceholder.tsx` — replace body with `<FileTree />` (keep filename to avoid surgery on `EditorLayout`).
- `src/persistence/localProject.ts` — new.
- `src/persistence/localProject.test.ts` — new.
- `src/hooks/useProjectPersistence.ts` — new.
- `src/hooks/useProjectPersistence.test.ts` — new.
- `src/App.tsx` — mount `useProjectPersistence()`.
- `src/components/sidebar/FileTree.test.tsx` — new.
- `docs/LLD.md` §2.5 and §3 (state) — refresh.

## Reuse first

- `src/store/useProjectStore.ts:135-206` — `setCurrentProject`, `createFile`, `deleteFile`, `renameFile`. **Do not re-implement file logic.**
- `src/store/useProjectStore.ts:151` — `createFile` already de-dupes by name; FileTree should surface its returning behavior, not parallel-check.
- `src/types/project.ts:1` — `ProjectFile.type` union is the icon map source.
- `src/components/editor/MonacoEditor.tsx:7` — reads `mainFile` via the store; FileTree only mutates via store actions, so the editor reacts automatically.

## Test plan

- **Unit (Vitest)**:
  - `FileTree.test.tsx`
    - Renders one row per file with active highlight on `mainFile`.
    - Click a `.tex` row → store `mainFile` updates (assert via store hook).
    - Click "New file", fill name, press Enter → file appears.
    - Duplicate name → inline error visible, store unchanged.
    - Right-click → Rename → edit → Enter → store updates.
    - Right-click → Delete → confirm → store updates.
  - `localProject.test.ts`
    - `saveProject(project)` then `loadProject()` round-trips identical data.
    - `loadProject()` returns null for empty storage.
    - `saveProject()` returns `over-quota` when serialized size > 5 MB (stub a small quota and oversize file).
  - `useProjectPersistence.test.ts`
    - On mount with localStorage prefilled, `currentProject` populates.
    - Editing a file triggers a save within 400 ms.
- **Manual**: open app, create file `intro.tex`, edit, refresh — file is still there. Add a 4 MB file → warning banner appears. Add another 2 MB file → save skipped, banner stays.

## Risks / open questions

- **localStorage quota varies by browser**: Chrome's 5 MB per origin is the conservative target. We compute `JSON.stringify(project).length * 2` (UTF-16 estimate) for the check; this is an upper bound, not a guarantee.
- **Default project shadowing**: if localStorage has a saved project, it must override `DEFAULT_PROJECT`. Persistence load runs after store init, so we explicitly call `setCurrentProject(loaded)` only when `loaded !== null`.
- **SSR**: `localStorage` is undefined in the vitest jsdom env unless we wire it; jsdom provides a stub by default, but we guard with `typeof window !== 'undefined'` for safety.
- **Context menu vs native**: we use a hand-rolled menu element (not the browser's). Right-click on the row calls `preventDefault` and shows our menu near the cursor.
