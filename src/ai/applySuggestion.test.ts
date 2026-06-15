import { describe, it, expect } from 'vitest'
import { applySuggestion } from './applySuggestion'
import { sampleResume } from '../templates/sampleResume'

describe('applySuggestion', () => {
  it('replaces a matching bullet and returns coordinates', () => {
    const target = sampleResume.work[0]!.highlights![0]!
    const outcome = applySuggestion(sampleResume, {
      bullet: target,
      rewrite: 'REWRITE_OK',
      reason: 'test',
    })
    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return
    expect(outcome.workIndex).toBe(0)
    expect(outcome.highlightIndex).toBe(0)
    expect(outcome.resume.work[0]!.highlights![0]).toBe('REWRITE_OK')
    expect(sampleResume.work[0]!.highlights![0]).toBe(target)
  })

  it('fails gracefully when bullet not found', () => {
    const outcome = applySuggestion(sampleResume, {
      bullet: 'Nonexistent line that was never in the resume.',
      rewrite: 'unused',
      reason: 'test',
    })
    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.reason).toMatch(/not found/i)
  })

  it('rejects empty bullet', () => {
    const outcome = applySuggestion(sampleResume, {
      bullet: '   ',
      rewrite: 'x',
      reason: 'test',
    })
    expect(outcome.ok).toBe(false)
  })

  it('is idempotent: a second apply with the same suggestion no-ops (bullet now contains rewrite)', () => {
    const target = sampleResume.work[0]!.highlights![0]!
    const first = applySuggestion(sampleResume, {
      bullet: target,
      rewrite: 'REWRITE_OK',
      reason: 'r',
    })
    expect(first.ok).toBe(true)
    if (!first.ok) return
    const second = applySuggestion(first.resume, {
      bullet: target,
      rewrite: 'REWRITE_OK',
      reason: 'r',
    })
    expect(second.ok).toBe(false)
  })
})
