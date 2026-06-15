import { describe, it, expect } from 'vitest'
import { createLocalOnlyClient } from './localOnly'

describe('localOnly client', () => {
  it('reports local-only status and rejects cloud ops', async () => {
    const c = createLocalOnlyClient()
    expect(c.status).toBe('local-only')
    await expect(c.connect()).rejects.toThrow()
    await expect(c.push({} as never)).rejects.toThrow()
    await expect(c.pull()).resolves.toBeNull()
  })

  it('subscribe returns a noop unsubscribe', () => {
    const c = createLocalOnlyClient()
    const off = c.subscribe(() => {})
    expect(typeof off).toBe('function')
    expect(() => off()).not.toThrow()
  })
})
