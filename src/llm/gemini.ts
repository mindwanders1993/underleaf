import type { LLMClient, LLMCompletionInput, LLMCompletionResult, LLMSettings } from './types'

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta'

interface GeminiCandidatePart {
  text?: string
}
interface GeminiCandidate {
  content?: { parts?: GeminiCandidatePart[] }
}
interface GeminiResponse {
  candidates?: GeminiCandidate[]
  promptFeedback?: { blockReason?: string }
}

export function createGeminiClient(settings: LLMSettings): LLMClient {
  if (!settings.apiKey) {
    throw new Error('Gemini provider requires an API key.')
  }
  const apiKey = settings.apiKey
  const defaultModel = settings.model

  return {
    provider: 'gemini',
    async complete(input: LLMCompletionInput): Promise<LLMCompletionResult> {
      const model = input.model ?? defaultModel
      const url = `${GEMINI_BASE}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`
      const body = {
        contents: [{ role: 'user', parts: [{ text: input.user }] }],
        ...(input.system
          ? { systemInstruction: { role: 'system', parts: [{ text: input.system }] } }
          : {}),
        generationConfig: {
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
        throw new Error(`Gemini HTTP ${res.status}: ${errBody.slice(0, 240)}`)
      }
      const data = (await res.json()) as GeminiResponse
      if (data.promptFeedback?.blockReason) {
        throw new Error(`Gemini blocked: ${data.promptFeedback.blockReason}`)
      }
      const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''
      return { text, raw: data }
    },
  }
}
