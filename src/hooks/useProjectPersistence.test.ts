import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useProjectStore } from '../store/useProjectStore'
import { useProjectPersistence, useProjectSizeUsage } from './useProjectPersistence'
import { STORAGE_KEY, STORAGE_LIMIT_BYTES } from '../persistence/localProject'
import type { Project } from '../types/project'

const baselineProject = useProjectStore.getState().currentProject!

const stored: Project = {
  id: 'persisted',
  name: 'persisted demo',
  mainFile: 'main.tex',
  files: [{ name: 'main.tex', type: 'tex', content: 'persisted body' }],
}

describe('useProjectPersistence', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useProjectStore.setState({ currentProject: baselineProject })
    vi.useFakeTimers()
  })

  it('hydrates from localStorage on mount', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    renderHook(() => useProjectPersistence())
    expect(useProjectStore.getState().currentProject).toEqual(stored)
  })

  it('saves on store change after debounce', () => {
    renderHook(() => useProjectPersistence())
    act(() => {
      useProjectStore.getState().updateFileContent('main.tex', 'updated body')
    })
    act(() => {
      vi.advanceTimersByTime(400)
    })
    const persisted = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as Project
    expect(persisted.files.find((f) => f.name === 'main.tex')?.content).toBe('updated body')
  })

  it('useProjectSizeUsage reports percent under limit', () => {
    const { result } = renderHook(() => useProjectSizeUsage())
    expect(result.current.limit).toBe(STORAGE_LIMIT_BYTES)
    expect(result.current.usagePercent).toBeGreaterThanOrEqual(0)
    expect(result.current.usagePercent).toBeLessThan(100)
  })
})
