import { describe, it, expect, beforeEach } from 'vitest'
import {
  STORAGE_KEY,
  loadLlmSettings,
  saveLlmSettings,
  clearLlmSettings,
} from './llmSettings'

describe('llmSettings persistence', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns defaults when empty', () => {
    const s = loadLlmSettings()
    expect(s.provider).toBe('gemini')
    expect(s.model).toBeTruthy()
  })

  it('round-trips a saved setting', () => {
    saveLlmSettings({ provider: 'ollama', model: 'qwen3:8b', ollamaHost: 'http://x:1' })
    const s = loadLlmSettings()
    expect(s.provider).toBe('ollama')
    expect(s.model).toBe('qwen3:8b')
    expect(s.ollamaHost).toBe('http://x:1')
  })

  it('clear removes the entry', () => {
    saveLlmSettings({ provider: 'ollama', model: 'qwen3:8b' })
    clearLlmSettings()
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
