import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createGeminiClient } from './gemini'

describe('createGeminiClient', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn() as unknown as typeof fetch
  })
  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('throws if API key is missing', () => {
    expect(() =>
      createGeminiClient({ provider: 'gemini', model: 'gemini-2.5-flash' }),
    ).toThrow(/API key/)
  })

  it('hits the model URL with the key and returns text', async () => {
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'hello world' }] } }],
      }),
    } as unknown as Response)

    const client = createGeminiClient({
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      apiKey: 'KEY',
    })
    const r = await client.complete({ user: 'ping' })
    expect(r.text).toBe('hello world')
    const calledUrl = fetchMock.mock.calls[0]![0] as string
    expect(calledUrl).toContain('gemini-2.5-flash:generateContent')
    expect(calledUrl).toContain('key=KEY')
  })

  it('throws on non-2xx', async () => {
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => 'forbidden',
    } as unknown as Response)

    const client = createGeminiClient({
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      apiKey: 'KEY',
    })
    await expect(client.complete({ user: 'ping' })).rejects.toThrow(/HTTP 403/)
  })
})
