import { describe, it, expect } from 'vitest'
import { exportResumeAsPlainText } from './plainText'
import { sampleResume } from '../templates/sampleResume'
import type { ResumeData } from '../types/resume'

describe('exportResumeAsPlainText', () => {
  it('is deterministic (same input → same output)', () => {
    const a = exportResumeAsPlainText(sampleResume)
    const b = exportResumeAsPlainText(sampleResume)
    expect(a).toBe(b)
  })

  it('matches a snapshot for the sample resume', () => {
    expect(exportResumeAsPlainText(sampleResume)).toMatchInlineSnapshot(`
      "Jane Doe — Software Engineer
      jane@example.com | +1 555 0100 | https://jane.example.com | San Francisco, CA

      SUMMARY
      -------
      Software engineer with 6 years of experience building TypeScript and Go services. Comfortable owning a feature end-to-end from RFC to ramp-up.

      EXPERIENCE
      ----------
      Senior Engineer, Acme Corp | 2023–Present | Remote
      - Led migration of the billing service from monolith to event-sourced architecture, cutting p99 latency 40%.
      - Mentored two junior engineers; both promoted within 18 months.

      Software Engineer, Initech | 2020–2023
      - Shipped self-serve API onboarding used by 300+ partners.
      - Designed an idempotency layer that eliminated double-charge incidents.

      PROJECTS
      --------
      tex-pdf-diff (https://github.com/jane/tex-pdf-diff)
      Visual diff tool for LaTeX-rendered PDFs.
      Stack: TypeScript, Vite, PDF.js
      - Used by ~50 academic writers; 600 stars.

      EDUCATION
      ---------
      State University | B.S., Computer Science | 2016–2020 | GPA 3.8

      SKILLS
      ------
      Languages: TypeScript, Go, Python, SQL
      Tooling: React, Postgres, Kafka, Kubernetes

      AWARDS
      ------
      Engineering Excellence Award | Acme Corp | 2024
      For the billing migration.
      "
    `)
  })

  it('omits sections with no data', () => {
    const minimal: ResumeData = {
      basics: { name: 'Solo' },
      work: [],
      education: [],
      projects: [],
      skills: [],
    }
    const out = exportResumeAsPlainText(minimal)
    expect(out).not.toContain('EXPERIENCE')
    expect(out).not.toContain('SKILLS')
    expect(out).toContain('Solo')
  })
})
