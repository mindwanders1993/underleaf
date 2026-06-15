import { DEFAULT_LLM_SETTINGS } from '../llm'
import type { LLMSettings } from '../llm'

export const STORAGE_KEY = 'underleaf.llm.v1'

function hasStorage(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage
  } catch {
    return false
  }
}

export function loadLlmSettings(): LLMSettings {
  if (!hasStorage()) return DEFAULT_LLM_SETTINGS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_LLM_SETTINGS
    const parsed = JSON.parse(raw) as Partial<LLMSettings>
    return { ...DEFAULT_LLM_SETTINGS, ...parsed }
  } catch (err) {
    console.warn('[underleaf] failed to load LLM settings:', err)
    return DEFAULT_LLM_SETTINGS
  }
}

export function saveLlmSettings(settings: LLMSettings): void {
  if (!hasStorage()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (err) {
    console.warn('[underleaf] failed to save LLM settings:', err)
  }
}

export function clearLlmSettings(): void {
  if (!hasStorage()) return
  window.localStorage.removeItem(STORAGE_KEY)
}
