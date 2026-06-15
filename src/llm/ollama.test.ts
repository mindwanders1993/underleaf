import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createOllamaClient } from './ollama'

describe('createOllamaClient', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn() as unknown as typeof fetch
  })
  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('defaults to localhost:11434/api/chat', async () => {
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ message: { content: 'pong' } }),
    } as unknown as Response)
    const client = createOllamaClient({ provider: 'ollama', model: 'qwen3:8b' })
    const r = await client.complete({ user: 'ping' })
    expect(r.text).toBe('pong')
    expect(fetchMock.mock.calls[0]![0]).toBe('http://localhost:11434/api/chat')
  })

  it('honours custom host with trailing slash', async () => {
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ message: { content: 'ok' } }),
    } as unknown as Response)
    const client = createOllamaClient({
      provider: 'ollama',
      model: 'qwen3:8b',
      ollamaHost: 'http://my-box:11434/',
    })
    await client.complete({ user: 'hi' })
    expect(fetchMock.mock.calls[0]![0]).toBe('http://my-box:11434/api/chat')
  })

  it('throws on non-2xx', async () => {
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'oops',
    } as unknown as Response)
    const client = createOllamaClient({ provider: 'ollama', model: 'qwen3:8b' })
    await expect(client.complete({ user: 'ping' })).rejects.toThrow(/HTTP 500/)
  })
})
