import type { LLMClient } from '../llm'

const SYSTEM_PROMPT = `You are a resume editor. Rewrite the single line provided so that it:
- Leads with a strong action verb (shipped, led, cut, built, designed, scaled, mentored, owned).
- Includes at least one concrete number (%, $, x, count, or duration) if at all possible from the context.
- Stays under 28 words.
- Stays factual to the original — do not invent metrics that were not implied.
- Drops filler words (responsible for, helped with, various, multiple).

Return ONLY the rewritten line, no markdown, no preamble, no quotes.`

function trimResponse(text: string): string {
  let t = text.trim()
  // strip wrapping quotes
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1).trim()
  }
  // strip leading list markers
  t = t.replace(/^[-*•]\s+/, '')
  // strip leading "Rewrite:" or "Output:" prefixes
  t = t.replace(/^(rewrite|output|result):\s*/i, '')
  // collapse any internal newlines into spaces
  t = t.replace(/\s*\n+\s*/g, ' ').trim()
  return t
}

export async function rewriteForImpact(input: string, client: LLMClient): Promise<string> {
  if (!input.trim()) return input
  const completion = await client.complete({
    system: SYSTEM_PROMPT,
    user: input,
    temperature: 0.3,
  })
  const rewritten = trimResponse(completion.text)
  return rewritten || input
}
