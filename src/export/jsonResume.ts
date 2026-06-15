import type { ResumeData } from '../types/resume'
import type { JsonResumeRoot } from './types'

export const JSON_RESUME_SCHEMA = 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json'

export function toJsonResume(resume: ResumeData): JsonResumeRoot {
  const b = resume.basics
  return {
    $schema: JSON_RESUME_SCHEMA,
    basics: {
      name: b.name,
      label: b.label,
      email: b.email,
      phone: b.phone,
      url: b.url,
      summary: b.summary,
      location: b.location ? { city: b.location } : undefined,
    },
    work: resume.work.map((w) => ({
      name: w.company,
      position: w.position,
      startDate: w.startDate,
      endDate: w.endDate,
      location: w.location,
      highlights: w.highlights,
    })),
    education: resume.education.map((e) => ({
      institution: e.institution,
      area: e.field,
      studyType: e.degree,
      startDate: e.startDate,
      endDate: e.endDate,
      score: e.gpa,
    })),
    projects: resume.projects.map((p) => ({
      name: p.name,
      description: p.description,
      url: p.url,
      keywords: p.stack,
      highlights: p.highlights,
    })),
    skills: resume.skills.map((g) => ({
      name: g.category,
      keywords: g.items,
    })),
    awards: resume.awards?.length
      ? resume.awards.map((a) => ({
          title: a.title,
          date: a.date,
          awarder: a.awarder,
          summary: a.summary,
        }))
      : undefined,
  }
}
