import { createGeminiClient } from './gemini'
import { createOllamaClient } from './ollama'
import type { LLMClient, LLMProvider, LLMProviderInfo, LLMSettings } from './types'

export type {
  LLMClient,
  LLMCompletionInput,
  LLMCompletionResult,
  LLMProvider,
  LLMProviderInfo,
  LLMSettings,
} from './types'

export const LLM_PROVIDERS: Record<LLMProvider, LLMProviderInfo> = {
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    needsApiKey: true,
    defaultModel: 'gemini-2.5-flash',
    suggestedModels: ['gemini-2.5-flash', 'gemini-2.5-pro'],
    notes: 'Free tier available at https://aistudio.google.com/apikey.',
  },
  ollama: {
    id: 'ollama',
    name: 'Local Ollama',
    needsApiKey: false,
    defaultModel: 'qwen3:8b',
    suggestedModels: ['qwen3:8b', 'qwen2.5-coder:7b', 'llama3.1:8b'],
    notes: 'Runs locally. Make sure `ollama serve` is running and the model is pulled.',
  },
}

export const DEFAULT_LLM_SETTINGS: LLMSettings = {
  provider: 'gemini',
  model: LLM_PROVIDERS.gemini.defaultModel,
}

export function getLLMClient(settings: LLMSettings): LLMClient {
  switch (settings.provider) {
    case 'gemini':
      return createGeminiClient(settings)
    case 'ollama':
      return createOllamaClient(settings)
    default: {
      const exhaustive: never = settings.provider
      throw new Error(`Unknown LLM provider: ${exhaustive as string}`)
    }
  }
}

export function isProviderConfigured(settings: LLMSettings): boolean {
  const info = LLM_PROVIDERS[settings.provider]
  if (info.needsApiKey && !settings.apiKey) return false
  if (!settings.model) return false
  return true
}
