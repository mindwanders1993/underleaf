import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  STORAGE_KEY,
  STORAGE_LIMIT_BYTES,
  estimatePayloadBytes,
  loadProject,
  saveProject,
  clearProject,
} from './localProject'
import type { Project } from '../types/project'

const baseProject: Project = {
  id: 'p1',
  name: 'demo',
  mainFile: 'main.tex',
  files: [{ name: 'main.tex', type: 'tex', content: 'hi' }],
}

describe('localProject', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('round-trips a saved project', () => {
    const outcome = saveProject(baseProject)
    expect(outcome.saved).toBe(true)
    expect(loadProject()).toEqual(baseProject)
  })

  it('returns null when storage is empty', () => {
    expect(loadProject()).toBeNull()
  })

  it('returns over-quota and skips write when payload exceeds 5 MB', () => {
    const bloated: Project = {
      ...baseProject,
      files: [
        {
          name: 'huge.tex',
          type: 'tex',
          content: 'x'.repeat(STORAGE_LIMIT_BYTES), // 5 MB * 2 bytes / char = 10 MB
        },
      ],
    }
    const outcome = saveProject(bloated)
    expect(outcome.saved).toBe(false)
    expect(outcome.reason).toBe('over-quota')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('preserves previous save when next save is rejected', () => {
    saveProject(baseProject)
    const bloated: Project = {
      ...baseProject,
      files: [{ name: 'huge.tex', type: 'tex', content: 'x'.repeat(STORAGE_LIMIT_BYTES) }],
    }
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    saveProject(bloated)
    warnSpy.mockRestore()
    expect(loadProject()).toEqual(baseProject)
  })

  it('estimatePayloadBytes reflects the file content size', () => {
    const small = estimatePayloadBytes(baseProject)
    const big = estimatePayloadBytes({
      ...baseProject,
      files: [{ name: 'main.tex', type: 'tex', content: 'x'.repeat(1000) }],
    })
    expect(big).toBeGreaterThan(small)
  })

  it('clearProject removes the saved entry', () => {
    saveProject(baseProject)
    clearProject()
    expect(loadProject()).toBeNull()
  })
})
