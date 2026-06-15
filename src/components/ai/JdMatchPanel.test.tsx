import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import JdMatchPanel from './JdMatchPanel'
import { useProjectStore } from '../../store/useProjectStore'
import { sampleResume } from '../../templates/sampleResume'
import type { JdMatchResult } from '../../ai/jdMatcher'

vi.mock('../../ai/jdMatcher', async () => {
  const actual = await vi.importActual<typeof import('../../ai/jdMatcher')>('../../ai/jdMatcher')
  return {
    ...actual,
    analyzeJobDescription: vi.fn(),
  }
})

import { analyzeJobDescription } from '../../ai/jdMatcher'
const analyzeMock = vi.mocked(analyzeJobDescription)

beforeEach(() => {
  useProjectStore.setState({
    currentProject: {
      id: 'fx',
      name: 'fx',
      mode: 'structured',
      mainFile: 'main.tex',
      files: [],
      resume: structuredClone(sampleResume),
      templateId: 'jakes-resume',
    },
    llmSettings: { provider: 'gemini', model: 'gemini-2.5-flash', apiKey: 'KEY' },
  })
  analyzeMock.mockReset()
})

function fakeResult(): JdMatchResult {
  const matchingBullet = sampleResume.work[0]!.highlights![0]!
  return {
    score: 80,
    gaps: ['Kubernetes'],
    suggestions: [
      { bullet: matchingBullet, rewrite: 'REWRITTEN_OK_FROM_TEST', reason: 'add metric' },
      { bullet: 'Nonexistent original.', rewrite: 'will fail', reason: 'check' },
    ],
    raw: '{}',
  }
}

describe('JdMatchPanel apply flow', () => {
  it('Apply writes the rewrite into the resume and disables the button', async () => {
    analyzeMock.mockResolvedValue(fakeResult())
    render(<JdMatchPanel />)
    fireEvent.change(screen.getByTestId('ul-jd-textarea'), { target: { value: 'Job description here.' } })
    fireEvent.click(screen.getByTestId('ul-jd-analyze'))
    await screen.findByTestId('ul-jd-result')

    fireEvent.click(screen.getByTestId('ul-jd-apply-0'))

    const r = useProjectStore.getState().currentProject!.resume!
    expect(r.work[0]!.highlights![0]).toBe('REWRITTEN_OK_FROM_TEST')
    expect(screen.getByTestId('ul-jd-apply-0')).toBeDisabled()
    expect(screen.getByTestId('ul-jd-apply-0')).toHaveTextContent(/Applied/i)
  })

  it('Apply shows an inline error when the bullet no longer matches', async () => {
    analyzeMock.mockResolvedValue(fakeResult())
    render(<JdMatchPanel />)
    fireEvent.change(screen.getByTestId('ul-jd-textarea'), { target: { value: 'JD' } })
    fireEvent.click(screen.getByTestId('ul-jd-analyze'))
    await screen.findByTestId('ul-jd-result')

    fireEvent.click(screen.getByTestId('ul-jd-apply-1'))
    expect(screen.getByText(/not found/i)).toBeInTheDocument()
    // resume untouched
    expect(useProjectStore.getState().currentProject!.resume!.work[0]!.highlights![0]).toBe(
      sampleResume.work[0]!.highlights![0]!,
    )
  })
})
