import type { ResumeData } from '../types/resume'
import type { JdSuggestion } from './jdMatcher'

export type ApplyOutcome =
  | { ok: true; resume: ResumeData; workIndex: number; highlightIndex: number }
  | { ok: false; reason: string }

export function applySuggestion(resume: ResumeData, suggestion: JdSuggestion): ApplyOutcome {
  const target = suggestion.bullet
  if (!target.trim()) {
    return { ok: false, reason: 'Suggestion has no bullet to match.' }
  }

  for (let wi = 0; wi < resume.work.length; wi++) {
    const highlights = resume.work[wi]!.highlights ?? []
    for (let hi = 0; hi < highlights.length; hi++) {
      if (highlights[hi] === target) {
        const nextHighlights = highlights.slice()
        nextHighlights[hi] = suggestion.rewrite
        const nextWork = resume.work.slice()
        nextWork[wi] = { ...resume.work[wi]!, highlights: nextHighlights }
        return {
          ok: true,
          resume: { ...resume, work: nextWork },
          workIndex: wi,
          highlightIndex: hi,
        }
      }
    }
  }

  return {
    ok: false,
    reason: 'Original bullet not found — re-run Analyze (was the resume edited since?).',
  }
}
