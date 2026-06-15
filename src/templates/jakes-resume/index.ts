import type { ResumeData, ResumeWork, ResumeEducation, ResumeProject } from '../../types/resume'
import { escapeLatex } from '../escapeLatex'
import type { TemplateRenderer } from '../types'

function joinDate(start?: string, end?: string): string {
  if (!start && !end) return ''
  if (!start) return escapeLatex(end ?? '')
  if (!end) return `${escapeLatex(start)} -- Present`
  return `${escapeLatex(start)} -- ${escapeLatex(end)}`
}

function renderHighlightList(items?: string[]): string {
  if (!items?.length) return ''
  const rows = items.map((h) => `    \\item ${escapeLatex(h)}`).join('\n')
  return [
    '  \\begin{itemize}[leftmargin=*, itemsep=2pt]',
    rows,
    '  \\end{itemize}',
  ].join('\n')
}

function renderWork(w: ResumeWork): string {
  const headerLeft = `\\textbf{${escapeLatex(w.position)}} \\hfill ${joinDate(w.startDate, w.endDate)}`
  const headerRight = `\\textit{${escapeLatex(w.company)}}${
    w.location ? ` \\hfill \\textit{${escapeLatex(w.location)}}` : ''
  }`
  return [headerLeft, '\\\\', headerRight, '', renderHighlightList(w.highlights)].join('\n')
}

function renderEducation(e: ResumeEducation): string {
  const headerLeft = `\\textbf{${escapeLatex(e.institution)}} \\hfill ${joinDate(e.startDate, e.endDate)}`
  const degree = [e.degree, e.field].filter(Boolean).map(escapeLatex).join(', ')
  const headerRight = `\\textit{${degree}}${e.gpa ? ` \\hfill GPA ${escapeLatex(e.gpa)}` : ''}`
  return [headerLeft, '\\\\', headerRight, '', renderHighlightList(e.highlights)].join('\n')
}

function renderProject(p: ResumeProject): string {
  const stack = p.stack?.length ? ` \\textit{(${p.stack.map(escapeLatex).join(', ')})}` : ''
  const name = `\\textbf{${escapeLatex(p.name)}}${stack}`
  const desc = p.description ? `\\\\ ${escapeLatex(p.description)}` : ''
  return [name, desc, renderHighlightList(p.highlights)].filter(Boolean).join('\n')
}

function renderContactLine(d: ResumeData): string {
  const b = d.basics
  const parts: string[] = []
  if (b.email) parts.push(escapeLatex(b.email))
  if (b.phone) parts.push(escapeLatex(b.phone))
  if (b.url) parts.push(escapeLatex(b.url))
  if (b.location) parts.push(escapeLatex(b.location))
  return parts.join(' \\;\\textbar\\; ')
}

function section(title: string, body: string): string {
  if (!body.trim()) return ''
  return `\\section*{${escapeLatex(title)}}\n${body}\n`
}

function renderSkills(groups: ResumeData['skills']): string {
  if (!groups.length) return ''
  return groups
    .map(
      (g) =>
        `\\textbf{${escapeLatex(g.category)}}: ${g.items.map(escapeLatex).join(', ')} \\\\`,
    )
    .join('\n')
}

function renderAwards(awards: ResumeData['awards']): string {
  if (!awards?.length) return ''
  return awards
    .map((a) => {
      const left = `\\textbf{${escapeLatex(a.title)}}`
      const right = a.date ? ` \\hfill ${escapeLatex(a.date)}` : ''
      const awarder = a.awarder ? ` \\\\ \\textit{${escapeLatex(a.awarder)}}` : ''
      const summary = a.summary ? ` \\\\ ${escapeLatex(a.summary)}` : ''
      return `${left}${right}${awarder}${summary}`
    })
    .join('\n\n')
}

function renderMainTex(data: ResumeData): string {
  const b = data.basics
  return `\\documentclass[10pt,a4paper]{article}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{titlesec}
\\titleformat{\\section*}{\\large\\bfseries}{}{0pt}{}[\\titlerule]
\\pagestyle{empty}

\\begin{document}

\\begin{center}
  {\\Huge \\textbf{${escapeLatex(b.name)}}} \\\\[4pt]
  ${b.label ? `\\textit{${escapeLatex(b.label)}} \\\\[2pt]` : ''}
  ${renderContactLine(data)}
\\end{center}

${b.summary ? section('Summary', escapeLatex(b.summary)) : ''}
${section('Experience', data.work.map(renderWork).join('\n\n'))}
${section('Projects', data.projects.map(renderProject).join('\n\n'))}
${section('Education', data.education.map(renderEducation).join('\n\n'))}
${section('Skills', renderSkills(data.skills))}
${section('Awards', renderAwards(data.awards))}

\\end{document}
`
}

const jakesResume: TemplateRenderer = {
  id: 'jakes-resume',
  name: "Jake's Resume (simplified)",
  description:
    'Single-column, ATS-friendly developer resume. Standard packages only — runs unmodified under SwiftLaTeX.',
  render(data) {
    return {
      mainTex: renderMainTex(data),
      files: [],
    }
  },
}

export default jakesResume
