import type { LLMClient } from '../llm'
import type { ResumeData } from '../types/resume'

export interface JdSuggestion {
  bullet: string
  rewrite: string
  reason: string
}

export interface JdMatchResult {
  score: number // 0–100
  gaps: string[]
  suggestions: JdSuggestion[]
  raw: string
}

const SYSTEM_PROMPT = `You are an expert resume coach grading a candidate's resume against a specific job description.

Respond ONLY with strict JSON matching this TypeScript type:

type Result = {
  score: number; // 0-100, candidate fit
  gaps: string[]; // missing requirements or weak coverage
  suggestions: { bullet: string; rewrite: string; reason: string }[]; // up to 5 most impactful rewrites
};

Do not add commentary outside the JSON. Do not wrap with markdown fences. Each "bullet" must quote an existing bullet from the resume verbatim. Each "rewrite" must keep the same factual core but make it stronger against the JD.`

function stripFences(text: string): string {
  let t = text.trim()
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '')
  }
  const firstBrace = t.indexOf('{')
  if (firstBrace > 0) t = t.slice(firstBrace)
  const lastBrace = t.lastIndexOf('}')
  if (lastBrace >= 0 && lastBrace < t.length - 1) t = t.slice(0, lastBrace + 1)
  return t.trim()
}

function parseResult(raw: string): JdMatchResult {
  const cleaned = stripFences(raw)
  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch (err) {
    throw new Error(
      `LLM did not return valid JSON.\nRaw output (first 240 chars):\n${raw.slice(0, 240)}\nParse error: ${(err as Error).message}`,
      { cause: err },
    )
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('LLM JSON response was not an object.')
  }
  const obj = parsed as Record<string, unknown>
  const score = typeof obj.score === 'number' ? Math.max(0, Math.min(100, obj.score)) : 0
  const gaps = Array.isArray(obj.gaps) ? (obj.gaps.filter((g) => typeof g === 'string') as string[]) : []
  const suggestionsRaw = Array.isArray(obj.suggestions) ? obj.suggestions : []
  const suggestions: JdSuggestion[] = []
  for (const s of suggestionsRaw) {
    if (typeof s !== 'object' || s === null) continue
    const so = s as Record<string, unknown>
    if (typeof so.bullet === 'string' && typeof so.rewrite === 'string' && typeof so.reason === 'string') {
      suggestions.push({ bullet: so.bullet, rewrite: so.rewrite, reason: so.reason })
    }
  }
  return { score, gaps, suggestions, raw }
}

function buildUserPrompt(resume: ResumeData, jd: string): string {
  return `Job description:
"""
${jd.trim()}
"""

Candidate resume (JSON):
${JSON.stringify(resume, null, 2)}

Return strict JSON per the format in the system message.`
}

export async function analyzeJobDescription(
  resume: ResumeData,
  jd: string,
  client: LLMClient,
): Promise<JdMatchResult> {
  if (!jd.trim()) {
    throw new Error('Job description is empty.')
  }
  const completion = await client.complete({
    system: SYSTEM_PROMPT,
    user: buildUserPrompt(resume, jd),
    temperature: 0.1,
  })
  return parseResult(completion.text)
}
