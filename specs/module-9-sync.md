# module-9-sync — Project export/import + cloud-sync stub

## Goal

Make projects portable. Users can **export** the current project to a `.json` file (full payload: files, resume, templateId, mode, mainFile, name, id) and **import** one back. Add a clean `CloudSyncClient` interface with a `LocalOnly` implementation that's the active default, plus a disabled "Connect cloud" button that says "coming soon". This ships real portability today without committing to a backend stack.

## Acceptance criteria

- [ ] `src/sync/types.ts` exports `CloudSyncClient` interface (`status`, `connect`, `disconnect`, `push`, `pull`, `subscribe`).
- [ ] `src/sync/localOnly.ts` implements a no-op client where `status = 'local-only'` and `connect()` rejects.
- [ ] `src/sync/projectIo.ts` exports `exportProjectToFile(project, filename?)` (triggers download) and `importProjectFromFile(file)` (validates payload shape, returns Project or throws).
- [ ] Imported payload validation: must have `id`, `name`, `mainFile`, `files: ProjectFile[]`, `mode: 'raw' | 'structured'`. Unknown fields preserved.
- [ ] `BackupModal` component triggered from FileTree footer "Backup" button. Shows: Export, Import (file picker), "Connect cloud sync (coming soon)" disabled button with copy explaining the local-first stance.
- [ ] Export button auto-suggests filename `<project.id>-<YYYY-MM-DD>.json`.
- [ ] Import success replaces `currentProject` via `setCurrentProject`; failure surfaces the error in the modal without mutating store.
- [ ] `npm run lint`, `npm run build` clean; ≤ 6 KB main growth.
- [ ] Vitest covers: projectIo round-trip (export → JSON → import); import rejects malformed payload; localOnly client status.

## Files to touch

- `src/sync/types.ts` — new.
- `src/sync/localOnly.ts` — new.
- `src/sync/projectIo.ts` — new.
- `src/sync/projectIo.test.ts` — new.
- `src/sync/localOnly.test.ts` — new.
- `src/components/backup/BackupModal.tsx` — new.
- `src/components/backup/BackupModal.css` — new.
- `src/components/backup/BackupModal.test.tsx` — new.
- `src/components/sidebar/FileTree.tsx` — add "Backup" footer button + modal mount.
- `docs/LLD.md` — new §2.18 Sync.

## Reuse first

- `src/store/useProjectStore.ts` — `setCurrentProject` already exists.
- `src/types/project.ts` — `Project` type is the canonical payload.
- Lucide icons (`Download`, `Upload`, `Cloud`, `X`).

## Risks / open questions

- **CloudSyncClient interface design**: kept narrow so we don't lock in a backend shape. The first real cloud impl (Supabase, PocketBase, or custom Postgres) will likely extend this.
- **Sensitive content in exports**: a project payload contains `resume` JSON which has PII. UI mentions this in the export dialog.
- **localStorage already does most of this**: the export is a *portable* persistence layer (download a file = move between browsers/devices). This is meaningful even before any cloud arrives.
