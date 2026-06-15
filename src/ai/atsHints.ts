import type { ResumeData } from '../types/resume'

export type HintSeverity = 'info' | 'warning' | 'error'

export interface AtsHint {
  id: string
  severity: HintSeverity
  title: string
  detail: string
}

const WEAK_VERBS = new Set([
  'responsible',
  'handled',
  'worked',
  'helped',
  'assisted',
  'duties',
  'tasks',
  'various',
  'multiple',
])

const STRONG_ACTION_VERBS = new Set([
  'led', 'built', 'shipped', 'launched', 'designed', 'architected', 'reduced', 'increased',
  'cut', 'grew', 'scaled', 'migrated', 'implemented', 'delivered', 'created', 'improved',
  'optimized', 'automated', 'mentored', 'owned', 'drove', 'authored', 'analyzed', 'wrote',
])

const NUMBER_PATTERN = /(\d+%|\$?\d[\d,.]*[kKmMbB]?|\d+\s*x|\d+x)/

function tokens(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s%$.]/g, ' ').split(/\s+/).filter(Boolean)
}

function firstWord(text: string): string {
  const t = text.trim().split(/\s+/)[0]?.toLowerCase() ?? ''
  return t.replace(/[^a-z]/g, '')
}

export function runAtsHints(resume: ResumeData): AtsHint[] {
  const hints: AtsHint[] = []
  const b = resume.basics

  if (!b.summary || b.summary.trim().length < 30) {
    hints.push({
      id: 'missing-summary',
      severity: 'warning',
      title: 'Add a one-line summary',
      detail:
        'A short summary at the top helps recruiters and ATS keyword scans. Aim for 30–60 words covering your role and signature skills.',
    })
  }

  if (!b.email || !b.email.includes('@')) {
    hints.push({
      id: 'missing-email',
      severity: 'error',
      title: 'Missing contact email',
      detail: 'Every resume needs a reachable email address in the header.',
    })
  }

  if (resume.work.length === 0) {
    hints.push({
      id: 'no-work',
      severity: 'error',
      title: 'No work history listed',
      detail: 'Add at least one role under Experience so recruiters have something to scan.',
    })
  }

  if (resume.skills.length === 0) {
    hints.push({
      id: 'no-skills',
      severity: 'warning',
      title: 'No skills section',
      detail: 'A clearly grouped Skills section dramatically improves keyword matching for ATS pipelines.',
    })
  }

  resume.work.forEach((w, wi) => {
    const bullets = w.highlights ?? []
    if (bullets.length === 0) {
      hints.push({
        id: `work-${wi}-no-bullets`,
        severity: 'warning',
        title: `"${w.position}" at ${w.company} has no bullets`,
        detail: 'Add 2–4 outcome-focused bullets per role with verbs and numbers.',
      })
      return
    }

    bullets.forEach((bullet, bi) => {
      const lower = bullet.toLowerCase()
      const first = firstWord(bullet)

      if (WEAK_VERBS.has(first) || /^was\b|^were\b/.test(lower)) {
        hints.push({
          id: `work-${wi}-bullet-${bi}-weak-verb`,
          severity: 'info',
          title: `Weak verb in "${w.position}" bullet`,
          detail: `"${bullet.slice(0, 64)}…" opens with a soft verb. Try a stronger action verb (e.g. shipped, led, cut).`,
        })
      } else if (STRONG_ACTION_VERBS.has(first)) {
        // ok
      }

      if (!NUMBER_PATTERN.test(bullet)) {
        hints.push({
          id: `work-${wi}-bullet-${bi}-no-metric`,
          severity: 'info',
          title: `Bullet lacks a metric`,
          detail: `"${bullet.slice(0, 64)}…" — add a number (%, $, x, or count) to quantify impact.`,
        })
      }

      const t = tokens(bullet)
      if (t.length > 35) {
        hints.push({
          id: `work-${wi}-bullet-${bi}-too-long`,
          severity: 'info',
          title: 'Bullet too long',
          detail: `Bullet runs ${t.length} words. Aim for under 30 for ATS-friendly density.`,
        })
      }
    })
  })

  return hints
}
