import { describe, it, expect, vi } from 'vitest'
import { analyzeJobDescription } from './jdMatcher'
import type { LLMClient } from '../llm'
import { sampleResume } from '../templates/sampleResume'

function mockClient(text: string): LLMClient {
  return {
    provider: 'gemini',
    complete: vi.fn(async () => ({ text, raw: {} })),
  }
}

describe('analyzeJobDescription', () => {
  it('parses well-formed JSON', async () => {
    const client = mockClient(
      JSON.stringify({
        score: 78,
        gaps: ['Kubernetes experience'],
        suggestions: [
          { bullet: 'Mentored two juniors', rewrite: 'Mentored two juniors; both promoted within 12 months.', reason: 'Adds outcome.' },
        ],
      }),
    )
    const r = await analyzeJobDescription(sampleResume, 'JD body', client)
    expect(r.score).toBe(78)
    expect(r.gaps).toEqual(['Kubernetes experience'])
    expect(r.suggestions[0]!.rewrite).toContain('promoted within 12 months')
  })

  it('tolerates ```json fences and a leading sentence', async () => {
    const fenced = "Here is the analysis:\n```json\n{\"score\":50,\"gaps\":[],\"suggestions\":[]}\n```"
    const client = mockClient(fenced)
    const r = await analyzeJobDescription(sampleResume, 'JD body', client)
    expect(r.score).toBe(50)
  })

  it('clamps score into 0-100', async () => {
    const client = mockClient(JSON.stringify({ score: 130, gaps: [], suggestions: [] }))
    const r = await analyzeJobDescription(sampleResume, 'JD body', client)
    expect(r.score).toBe(100)
  })

  it('rejects when LLM produces non-JSON', async () => {
    const client = mockClient('I cannot do that, Dave.')
    await expect(analyzeJobDescription(sampleResume, 'JD', client)).rejects.toThrow(/valid JSON/)
  })

  it('rejects when JD is blank', async () => {
    const client = mockClient('{}')
    await expect(analyzeJobDescription(sampleResume, '   ', client)).rejects.toThrow(/empty/)
  })

  it('drops malformed suggestion entries', async () => {
    const client = mockClient(
      JSON.stringify({
        score: 60,
        gaps: ['x'],
        suggestions: [
          { bullet: 'b', rewrite: 'r', reason: 'r' },
          { not: 'a suggestion' },
          { bullet: 'b2', rewrite: 'r2', reason: 'r2' },
        ],
      }),
    )
    const r = await analyzeJobDescription(sampleResume, 'JD', client)
    expect(r.suggestions).toHaveLength(2)
  })
})
