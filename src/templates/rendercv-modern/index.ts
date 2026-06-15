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
    '  \\begin{itemize}[leftmargin=*, itemsep=2pt, topsep=2pt]',
    ...items.map((h) => `    \\item ${escapeLatex(h)}`),
    '  \\end{itemize}',
  ].join('\n')
}

function workBlock(w: ResumeWork): string {
  const left = `\\textbf{${escapeLatex(w.company)}} \\textendash{} ${escapeLatex(w.position)}`
  const right = dateRange(w.startDate, w.endDate)
  return `\\noindent ${left} \\hfill {\\small ${right}} \\\\
${w.location ? `{\\small ${escapeLatex(w.location)}} \\\\` : ''}
${bullets(w.highlights)}
\\vspace{4pt}`
}

function projectBlock(p: ResumeProject): string {
  const stack = p.stack?.length
    ? ` \\hfill {\\small ${p.stack.map(escapeLatex).join(' \\textbullet{} ')}}`
    : ''
  const name = `\\noindent \\textbf{${escapeLatex(p.name)}}${stack}`
  const desc = p.description ? `\\\\ ${escapeLatex(p.description)}` : ''
  return [name, desc, bullets(p.highlights), '\\vspace{4pt}'].filter(Boolean).join('\n')
}

function educationBlock(e: ResumeEducation): string {
  const degree = [e.degree, e.field].filter(Boolean).map(escapeLatex).join(', ')
  return `\\noindent \\textbf{${escapeLatex(e.institution)}} \\hfill {\\small ${dateRange(e.startDate, e.endDate)}} \\\\
${degree ? `{\\small ${degree}}` : ''}${e.gpa ? ` \\hfill {\\small GPA ${escapeLatex(e.gpa)}}` : ''}
\\vspace{4pt}`
}

function skillsBlock(data: ResumeData): string {
  if (!data.skills.length) return ''
  return data.skills
    .map(
      (g) =>
        `\\noindent \\textbf{${escapeLatex(g.category)}} \\hfill ${g.items.map(escapeLatex).join(' \\textbullet{} ')} \\\\`,
    )
    .join('\n')
}

function awardsBlock(data: ResumeData): string {
  if (!data.awards?.length) return ''
  return data.awards
    .map((a) => {
      const head = `\\noindent \\textbf{${escapeLatex(a.title)}}${a.awarder ? ` \\textendash{} ${escapeLatex(a.awarder)}` : ''}`
      const date = a.date ? ` \\hfill {\\small ${escapeLatex(a.date)}}` : ''
      const summary = a.summary ? `\\\\ ${escapeLatex(a.summary)}` : ''
      return `${head}${date}${summary}\n\\vspace{4pt}`
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
  return parts.join(' \\textbullet{} ')
}

function section(title: string, body: string): string {
  if (!body.trim()) return ''
  return `\\section*{\\normalsize \\textsc{${escapeLatex(title.toLowerCase())}}}\n${body}\n`
}

function renderMainTex(data: ResumeData): string {
  const b = data.basics
  return `\\documentclass[10pt,a4paper]{article}
\\usepackage[margin=0.8in]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{parskip}
\\usepackage{titlesec}
\\titleformat{\\section*}{\\bfseries}{}{0pt}{}
\\titlespacing*{\\section*}{0pt}{12pt}{4pt}
\\pagestyle{empty}

\\begin{document}

\\begin{flushleft}
  {\\LARGE \\textbf{${escapeLatex(b.name)}}}\\\\[2pt]
  ${b.label ? `{\\small ${escapeLatex(b.label)}}\\\\[2pt]` : ''}
  {\\small ${contactLine(data)}}
\\end{flushleft}
\\vspace{6pt}

${b.summary ? section('Summary', `\\noindent ${escapeLatex(b.summary)}`) : ''}
${section('Experience', data.work.map(workBlock).join('\n\n'))}
${section('Projects', data.projects.map(projectBlock).join('\n\n'))}
${section('Education', data.education.map(educationBlock).join('\n\n'))}
${section('Skills', skillsBlock(data))}
${section('Awards', awardsBlock(data))}

\\end{document}
`
}

const renderCvModern: TemplateRenderer = {
  id: 'rendercv-modern',
  name: 'RenderCV Modern',
  description:
    'Minimal modern layout. Small-caps section titles, parskip spacing, side dates — closest to a typical RenderCV output.',
  render(data) {
    return { mainTex: renderMainTex(data), files: [] }
  },
}

export default renderCvModern
