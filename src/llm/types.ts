export type LLMProvider = 'gemini' | 'ollama'

export interface LLMSettings {
  provider: LLMProvider
  model: string
  apiKey?: string
  ollamaHost?: string
}

export interface LLMCompletionInput {
  system?: string
  user: string
  model?: string // override settings.model
  temperature?: number
}

export interface LLMCompletionResult {
  text: string
  raw: unknown
}

export interface LLMClient {
  readonly provider: LLMProvider
  complete(input: LLMCompletionInput): Promise<LLMCompletionResult>
}

export interface LLMProviderInfo {
  id: LLMProvider
  name: string
  needsApiKey: boolean
  defaultModel: string
  suggestedModels: string[]
  notes?: string
}
