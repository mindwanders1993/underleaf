import { describe, it, expect, vi } from 'vitest'
import { rewriteForImpact } from './rewriteForImpact'
import type { LLMClient } from '../llm'

function mockClient(text: string): LLMClient {
  return { provider: 'gemini', complete: vi.fn(async () => ({ text, raw: {} })) }
}

describe('rewriteForImpact', () => {
  it('returns input unchanged when blank', async () => {
    const client = mockClient('UNUSED')
    expect(await rewriteForImpact('   ', client)).toBe('   ')
    expect(client.complete).not.toHaveBeenCalled()
  })

  it('strips wrapping quotes', async () => {
    const client = mockClient('"Shipped self-serve API onboarding for 300 partners, cutting setup time 60%."')
    const result = await rewriteForImpact('original bullet', client)
    expect(result.startsWith('"')).toBe(false)
    expect(result.endsWith('"')).toBe(false)
  })

  it('strips list markers and prefixes', async () => {
    const client = mockClient('- Output: Shipped feature X with 30% lift')
    const result = await rewriteForImpact('original', client)
    expect(result).toBe('Shipped feature X with 30% lift')
  })

  it('returns original on empty LLM output', async () => {
    const client = mockClient('   ')
    expect(await rewriteForImpact('original', client)).toBe('original')
  })
})
