import type { LLMClient, LLMCompletionInput, LLMCompletionResult, LLMSettings } from './types'

const DEFAULT_HOST = 'http://localhost:11434'

interface OllamaChatResponse {
  message?: { content?: string }
  done?: boolean
}

export function createOllamaClient(settings: LLMSettings): LLMClient {
  const host = (settings.ollamaHost ?? DEFAULT_HOST).replace(/\/+$/, '')
  const defaultModel = settings.model

  return {
    provider: 'ollama',
    async complete(input: LLMCompletionInput): Promise<LLMCompletionResult> {
      const url = `${host}/api/chat`
      const messages = [
        ...(input.system ? [{ role: 'system', content: input.system }] : []),
        { role: 'user', content: input.user },
      ]
      const body = {
        model: input.model ?? defaultModel,
        messages,
        stream: false,
        options: {
          temperature: input.temperature ?? 0.2,
        },
      }
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const errBody = await res.text()
        throw new Error(`Ollama HTTP ${res.status}: ${errBody.slice(0, 240)}`)
      }
      const data = (await res.json()) as OllamaChatResponse
      return { text: data.message?.content ?? '', raw: data }
    },
  }
}
