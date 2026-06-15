import type { ResumeData, ResumeWork, ResumeEducation, ResumeProject } from '../types/resume'

function dateRange(start?: string, end?: string): string {
  if (!start && !end) return ''
  if (!start) return end ?? ''
  if (!end) return `${start}–Present`
  return `${start}–${end}`
}

function workBlock(w: ResumeWork): string {
  const head = [
    `${w.position}, ${w.company}`.trim(),
    dateRange(w.startDate, w.endDate),
    w.location,
  ]
    .filter(Boolean)
    .join(' | ')
  const bullets = (w.highlights ?? []).map((h) => `- ${h}`)
  return [head, ...bullets].join('\n')
}

function projectBlock(p: ResumeProject): string {
  const head = p.url ? `${p.name} (${p.url})` : p.name
  const stack = p.stack?.length ? `Stack: ${p.stack.join(', ')}` : ''
  const desc = p.description ?? ''
  const bullets = (p.highlights ?? []).map((h) => `- ${h}`)
  return [head, desc, stack, ...bullets].filter(Boolean).join('\n')
}

function educationBlock(e: ResumeEducation): string {
  const degree = [e.degree, e.field].filter(Boolean).join(', ')
  const head = [
    e.institution,
    degree,
    dateRange(e.startDate, e.endDate),
    e.gpa ? `GPA ${e.gpa}` : '',
  ]
    .filter(Boolean)
    .join(' | ')
  const bullets = (e.highlights ?? []).map((h) => `- ${h}`)
  return [head, ...bullets].join('\n')
}

function section(title: string, body: string): string {
  if (!body.trim()) return ''
  return `${title.toUpperCase()}\n${'-'.repeat(title.length)}\n${body}`
}

function contactLine(d: ResumeData): string {
  const parts = [d.basics.email, d.basics.phone, d.basics.url, d.basics.location].filter(Boolean)
  return parts.join(' | ')
}

export function exportResumeAsPlainText(resume: ResumeData): string {
  const b = resume.basics
  const header = [
    `${b.name}${b.label ? ` — ${b.label}` : ''}`,
    contactLine(resume),
  ]
    .filter(Boolean)
    .join('\n')

  const summary = b.summary ? section('Summary', b.summary) : ''
  const experience = section('Experience', resume.work.map(workBlock).join('\n\n'))
  const projects = section('Projects', resume.projects.map(projectBlock).join('\n\n'))
  const education = section('Education', resume.education.map(educationBlock).join('\n\n'))
  const skills = section(
    'Skills',
    resume.skills.map((g) => `${g.category}: ${g.items.join(', ')}`).join('\n'),
  )
  const awards = resume.awards?.length
    ? section(
        'Awards',
        resume.awards
          .map((a) =>
            [a.title, a.awarder, a.date].filter(Boolean).join(' | ') +
            (a.summary ? `\n${a.summary}` : ''),
          )
          .join('\n\n'),
      )
    : ''

  return [header, summary, experience, projects, education, skills, awards]
    .filter(Boolean)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim() + '\n'
}
