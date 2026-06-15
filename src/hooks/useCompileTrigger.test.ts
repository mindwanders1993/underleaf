import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCompileTrigger } from './useCompileTrigger'
import { useProjectStore } from '../store/useProjectStore'
import { sampleResume } from '../templates/sampleResume'
import { DEFAULT_TEMPLATE_ID } from '../templates'
import type { LatexCompileInput, LatexCompileResult } from '../engine'

const compileMock = vi.fn(
  async (_input: LatexCompileInput): Promise<LatexCompileResult> => ({
    pdfBuffer: new Uint8Array([1]),
    log: '',
    errors: [],
  }),
)
const trackBlobUrlMock = vi.fn((u: string | null) => u)

vi.mock('../engine', () => ({
  getLatexEngine: () => ({
    status: 'ready',
    init: async () => {},
    compile: compileMock,
    trackBlobUrl: trackBlobUrlMock,
    dispose: () => {},
  }),
}))

beforeEach(() => {
  compileMock.mockClear()
  trackBlobUrlMock.mockClear()
  useProjectStore.setState({
    currentProject: {
      id: 'fx',
      name: 'fx',
      mode: 'raw',
      mainFile: 'main.tex',
      files: [{ name: 'main.tex', type: 'tex', content: 'raw content' }],
    },
    compilationState: { status: 'IDLE', pdfBlobUrl: null, logs: [], errors: [] },
  })

  const originalCreate = URL.createObjectURL
  URL.createObjectURL = vi.fn(() => 'blob:fake') as typeof URL.createObjectURL
  // restore later via afterEach if needed — vitest unstubAllGlobals not used
  ;(globalThis as Record<string, unknown>).__originalCreate = originalCreate
})

describe('useCompileTrigger', () => {
  it('passes project.files to engine in raw mode', async () => {
    renderHook(() => useCompileTrigger())
    act(() => {
      useProjectStore.getState().setCompileStatus('COMPILING')
    })
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })
    expect(compileMock).toHaveBeenCalledTimes(1)
    const call = compileMock.mock.calls[0]![0] as unknown as { files: { content: string }[]; mainFile: string }
    expect(call.mainFile).toBe('main.tex')
    expect(call.files[0]!.content).toBe('raw content')
  })

  it('renders template in structured mode before calling engine', async () => {
    useProjectStore.setState({
      currentProject: {
        id: 'fx',
        name: 'fx',
        mode: 'structured',
        mainFile: 'main.tex',
        files: [],
        resume: sampleResume,
        templateId: DEFAULT_TEMPLATE_ID,
      },
    })

    renderHook(() => useCompileTrigger())
    act(() => {
      useProjectStore.getState().setCompileStatus('COMPILING')
    })
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    expect(compileMock).toHaveBeenCalledTimes(1)
    const call = compileMock.mock.calls[0]![0] as unknown as {
      files: { name: string; content: string }[]
      mainFile: string
    }
    expect(call.mainFile).toBe('main.tex')
    expect(call.files[0]!.name).toBe('main.tex')
    expect(call.files[0]!.content).toContain('Jane Doe')
    expect(call.files[0]!.content).toContain('\\documentclass')
  })

  it('errors when structured project is missing template', async () => {
    useProjectStore.setState({
      currentProject: {
        id: 'fx',
        name: 'fx',
        mode: 'structured',
        mainFile: 'main.tex',
        files: [],
        resume: sampleResume,
        templateId: undefined,
      },
    })

    renderHook(() => useCompileTrigger())
    act(() => {
      useProjectStore.getState().setCompileStatus('COMPILING')
    })
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })
    expect(compileMock).not.toHaveBeenCalled()
    expect(useProjectStore.getState().compilationState.status).toBe('ERROR')
  })
})
