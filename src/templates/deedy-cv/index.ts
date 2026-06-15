import type { ResumeData, ResumeWork, ResumeEducation, ResumeProject } from '../../types/resume'
import { escapeLatex } from '../escapeLatex'
import type { TemplateRenderer } from '../types'

function dateRange(start?: string, end?: string): string {
  if (!start && !end) return ''
  if (!start) return escapeLatex(end ?? '')
  if (!end) return `${escapeLatex(start)} -- Present`
  return `${escapeLatex(start)} -- ${escapeLatex(end)}`
}

function bullets(items?: string[]): string {
  if (!items?.length) return ''
  return [
    '  \\begin{itemize}[leftmargin=*, itemsep=1pt, topsep=2pt]',
    ...items.map((h) => `    \\item ${escapeLatex(h)}`),
    '  \\end{itemize}',
  ].join('\n')
}

function workBlock(w: ResumeWork): string {
  const heading = `\\textbf{${escapeLatex(w.position)}} \\hfill ${dateRange(w.startDate, w.endDate)} \\\\`
  const subhead = `\\textit{${escapeLatex(w.company)}}${
    w.location ? ` \\hfill \\textit{${escapeLatex(w.location)}}` : ''
  } \\\\`
  return [heading, subhead, bullets(w.highlights), '\\vspace{4pt}'].filter(Boolean).join('\n')
}

function projectBlock(p: ResumeProject): string {
  const stack = p.stack?.length ? ` -- \\textit{${p.stack.map(escapeLatex).join(', ')}}` : ''
  const heading = `\\textbf{${escapeLatex(p.name)}}${stack} \\\\`
  const desc = p.description ? `${escapeLatex(p.description)} \\\\` : ''
  return [heading, desc, bullets(p.highlights), '\\vspace{4pt}'].filter(Boolean).join('\n')
}

function educationBlock(e: ResumeEducation): string {
  const heading = `\\textbf{${escapeLatex(e.institution)}} \\\\`
  const degree = [e.degree, e.field].filter(Boolean).map(escapeLatex).join(', ')
  const sub = degree ? `\\textit{${degree}} \\\\` : ''
  const dates = dateRange(e.startDate, e.endDate)
  const meta = [dates, e.gpa ? `GPA ${escapeLatex(e.gpa)}` : ''].filter(Boolean).join(' \\;\\textbar\\; ')
  return [heading, sub, meta, '\\vspace{4pt}'].filter(Boolean).join('\n')
}

function skillsBlock(data: ResumeData): string {
  if (!data.skills.length) return ''
  return data.skills
    .map(
      (g) =>
        `\\textbf{${escapeLatex(g.category)}} \\\\ ${g.items.map(escapeLatex).join(', ')} \\\\[4pt]`,
    )
    .join('\n')
}

function awardsBlock(data: ResumeData): string {
  if (!data.awards?.length) return ''
  return data.awards
    .map((a) => {
      const head = `\\textbf{${escapeLatex(a.title)}}${a.date ? ` -- ${escapeLatex(a.date)}` : ''}`
      const sub = a.awarder ? `\\textit{${escapeLatex(a.awarder)}} \\\\` : ''
      return [head, '\\\\', sub].filter(Boolean).join('\n')
    })
    .join('\n\n')
}

function contactLine(data: ResumeData): string {
  const b = data.basics
  const parts: string[] = []
  if (b.email) parts.push(escapeLatex(b.email))
  if (b.phone) parts.push(escapeLatex(b.phone))
  if (b.url) parts.push(escapeLatex(b.url))
  if (b.location) parts.push(escapeLatex(b.location))
  return parts.join(' \\;\\textbar\\; ')
}

function section(title: string, body: string): string {
  if (!body.trim()) return ''
  return `\\noindent{\\large \\textbf{${escapeLatex(title)}}}\n\\hrule\n\\vspace{4pt}\n${body}\n\\vspace{8pt}\n`
}

function renderMainTex(data: ResumeData): string {
  const b = data.basics

  const leftColumn = [
    section('Skills', skillsBlock(data)),
    section('Education', data.education.map(educationBlock).join('\n')),
    section('Awards', awardsBlock(data)),
  ]
    .filter(Boolean)
    .join('\n')

  const rightColumn = [
    section('Experience', data.work.map(workBlock).join('\n')),
    section('Projects', data.projects.map(projectBlock).join('\n')),
  ]
    .filter(Boolean)
    .join('\n')

  return `\\documentclass[10pt,a4paper]{article}
\\usepackage[margin=0.7in]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\pagestyle{empty}

\\begin{document}

\\begin{center}
  {\\Huge \\textbf{${escapeLatex(b.name)}}} \\\\[2pt]
  ${b.label ? `\\textit{${escapeLatex(b.label)}} \\\\[2pt]` : ''}
  ${contactLine(data)}
\\end{center}
\\vspace{6pt}
${b.summary ? `\\noindent ${escapeLatex(b.summary)} \\\\\n\\vspace{8pt}` : ''}

\\noindent
\\begin{minipage}[t]{0.30\\textwidth}
${leftColumn}
\\end{minipage}\\hfill
\\begin{minipage}[t]{0.66\\textwidth}
${rightColumn}
\\end{minipage}

\\end{document}
`
}

const deedyCv: TemplateRenderer = {
  id: 'deedy-cv',
  name: 'Deedy (two-column)',
  description:
    'Two-column layout: skills/education on the left, experience/projects on the right. Compact for one-pagers.',
  render(data) {
    return { mainTex: renderMainTex(data), files: [] }
  },
}

export default deedyCv
