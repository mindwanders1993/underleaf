import { describe, it, expect } from 'vitest'
import { runAtsHints } from './atsHints'
import type { ResumeData } from '../types/resume'

const strongBullet = 'Shipped self-serve API onboarding used by 300+ partners, cutting setup time 60%.'
const weakBullet = 'Responsible for various billing tasks.'

const minimal: ResumeData = {
  basics: { name: 'Test User' },
  work: [],
  education: [],
  projects: [],
  skills: [],
}

describe('runAtsHints', () => {
  it('flags missing summary, email, work, skills', () => {
    const hints = runAtsHints(minimal)
    const ids = hints.map((h) => h.id)
    expect(ids).toContain('missing-summary')
    expect(ids).toContain('missing-email')
    expect(ids).toContain('no-work')
    expect(ids).toContain('no-skills')
  })

  it('flags weak verbs and missing metrics in bullets', () => {
    const r: ResumeData = {
      basics: {
        name: 'A',
        email: 'a@b.com',
        summary:
          'Solid summary with enough content to clear the thirty character minimum length.',
      },
      work: [
        { company: 'Co', position: 'Eng', highlights: [weakBullet] },
      ],
      education: [],
      projects: [],
      skills: [{ category: 'X', items: ['Y'] }],
    }
    const ids = runAtsHints(r).map((h) => h.id)
    expect(ids.some((id) => id.endsWith('weak-verb'))).toBe(true)
    expect(ids.some((id) => id.endsWith('no-metric'))).toBe(true)
  })

  it('does not flag strong bullets with metrics', () => {
    const r: ResumeData = {
      basics: {
        name: 'A',
        email: 'a@b.com',
        summary:
          'Solid summary with enough content to clear the thirty character minimum length.',
      },
      work: [{ company: 'Co', position: 'Eng', highlights: [strongBullet] }],
      education: [],
      projects: [],
      skills: [{ category: 'X', items: ['Y'] }],
    }
    const hints = runAtsHints(r)
    expect(hints.filter((h) => h.id.startsWith('work-')).length).toBe(0)
  })

  it('flags overly long bullets', () => {
    const longBullet =
      'Shipped a payments microservice processing 99.9 percent uptime that integrated stripe paypal adyen klarna affirm braintree square and other gateways across multiple regions with regulatory paperwork, SOC2 compliance reviews, PCI audits, vendor onboarding, customer support runbooks, and a quarterly executive review process.'
    const r: ResumeData = {
      basics: { name: 'A', email: 'a@b.com', summary: 'x'.repeat(40) },
      work: [{ company: 'Co', position: 'Eng', highlights: [longBullet] }],
      education: [],
      projects: [],
      skills: [{ category: 'X', items: ['Y'] }],
    }
    const ids = runAtsHints(r).map((h) => h.id)
    expect(ids.some((id) => id.endsWith('too-long'))).toBe(true)
  })
})
