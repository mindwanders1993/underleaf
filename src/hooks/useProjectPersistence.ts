import { useEffect, useMemo, useRef } from 'react'
import { useProjectStore } from '../store/useProjectStore'
import {
  STORAGE_LIMIT_BYTES,
  estimatePayloadBytes,
  loadProject,
  saveProject,
} from '../persistence/localProject'

const SAVE_DEBOUNCE_MS = 300

export function useProjectPersistence(): void {
  const project = useProjectStore((s) => s.currentProject)
  const setCurrentProject = useProjectStore((s) => s.setCurrentProject)
  const hydratedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true
    const loaded = loadProject()
    if (loaded) setCurrentProject(loaded)
  }, [setCurrentProject])

  useEffect(() => {
    if (!hydratedRef.current || !project) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      saveProject(project)
    }, SAVE_DEBOUNCE_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [project])
}

export interface ProjectSizeUsage {
  bytes: number
  limit: number
  usagePercent: number
}

export function useProjectSizeUsage(): ProjectSizeUsage {
  const project = useProjectStore((s) => s.currentProject)
  const bytes = useMemo(() => (project ? estimatePayloadBytes(project) : 0), [project])
  return {
    bytes,
    limit: STORAGE_LIMIT_BYTES,
    usagePercent: STORAGE_LIMIT_BYTES === 0 ? 0 : (bytes / STORAGE_LIMIT_BYTES) * 100,
  }
}
