import type { Project } from '../types/project'

export const STORAGE_KEY = 'underleaf.project.v1'
export const STORAGE_LIMIT_BYTES = 5 * 1024 * 1024 // 5 MB

export interface SaveOutcome {
  saved: boolean
  bytes: number
  reason?: 'over-quota' | 'no-storage' | 'serialize-failed'
}

function hasStorage(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage
  } catch {
    return false
  }
}

export function estimatePayloadBytes(project: Project): number {
  try {
    // UTF-16 char ≈ 2 bytes — upper bound of localStorage cost.
    return JSON.stringify(project).length * 2
  } catch {
    return Number.POSITIVE_INFINITY
  }
}

export function loadProject(): Project | null {
  if (!hasStorage()) return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Project
  } catch (err) {
    console.warn('[underleaf] failed to load project from localStorage:', err)
    return null
  }
}

export function saveProject(project: Project): SaveOutcome {
  if (!hasStorage()) return { saved: false, bytes: 0, reason: 'no-storage' }
  let serialized: string
  try {
    serialized = JSON.stringify(project)
  } catch {
    return { saved: false, bytes: 0, reason: 'serialize-failed' }
  }
  const bytes = serialized.length * 2
  if (bytes > STORAGE_LIMIT_BYTES) {
    console.warn(
      `[underleaf] project too large (${(bytes / 1024 / 1024).toFixed(2)} MB) — skipping save.`,
    )
    return { saved: false, bytes, reason: 'over-quota' }
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, serialized)
    return { saved: true, bytes }
  } catch (err) {
    console.warn('[underleaf] localStorage.setItem failed:', err)
    return { saved: false, bytes, reason: 'over-quota' }
  }
}

export function clearProject(): void {
  if (!hasStorage()) return
  window.localStorage.removeItem(STORAGE_KEY)
}
