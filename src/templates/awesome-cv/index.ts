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
  const left = `{\\large \\textbf{${escapeLatex(w.position)}}} -- {\\color{accentcolor} ${escapeLatex(w.company)}}`
  const right = dateRange(w.startDate, w.endDate)
  return `\\noindent ${left} \\hfill ${right} \\\\
${w.location ? `\\textit{${escapeLatex(w.location)}} \\\\` : ''}
${bullets(w.highlights)}
\\vspace{6pt}`
}

function projectBlock(p: ResumeProject): string {
  const stack = p.stack?.length
    ? ` \\hfill \\textit{${p.stack.map(escapeLatex).join(', ')}}`
    : ''
  const name = `\\noindent {\\large \\textbf{${escapeLatex(p.name)}}}${stack}`
  const desc = p.description ? `\\\\ ${escapeLatex(p.description)}` : ''
  return [name, desc, bullets(p.highlights), '\\vspace{6pt}'].filter(Boolean).join('\n')
}

function educationBlock(e: ResumeEducation): string {
  const degree = [e.degree, e.field].filter(Boolean).map(escapeLatex).join(', ')
  return `\\noindent {\\large \\textbf{${escapeLatex(e.institution)}}} \\hfill ${dateRange(e.startDate, e.endDate)} \\\\
${degree ? `\\textit{${degree}}` : ''}${e.gpa ? ` \\hfill GPA ${escapeLatex(e.gpa)}` : ''}
${bullets(e.highlights)}
\\vspace{6pt}`
}

function skillsBlock(data: ResumeData): string {
  if (!data.skills.length) return ''
  return data.skills
    .map(
      (g) =>
        `\\noindent \\textbf{${escapeLatex(g.category)}}: ${g.items.map(escapeLatex).join(', ')} \\\\`,
    )
    .join('\n')
}

function awardsBlock(data: ResumeData): string {
  if (!data.awards?.length) return ''
  return data.awards
    .map((a) => {
      const head = `\\noindent \\textbf{${escapeLatex(a.title)}}${a.date ? ` \\hfill ${escapeLatex(a.date)}` : ''}`
      const sub = a.awarder ? `\\\\ \\textit{${escapeLatex(a.awarder)}}` : ''
      const summary = a.summary ? `\\\\ ${escapeLatex(a.summary)}` : ''
      return `${head}${sub}${summary}\n\\vspace{4pt}`
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
  return `\\section*{${escapeLatex(title)}}\n${body}\n`
}

function renderMainTex(data: ResumeData): string {
  const b = data.basics
  return `\\documentclass[10pt,a4paper]{article}
\\usepackage[margin=0.7in]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage{titlesec}
\\definecolor{accentcolor}{HTML}{0E76A8}
\\titleformat{\\section*}{\\large\\bfseries\\color{accentcolor}}{}{0pt}{}[\\color{accentcolor}\\titlerule]
\\titlespacing*{\\section*}{0pt}{8pt}{4pt}
\\pagestyle{empty}

\\begin{document}

\\begin{center}
  {\\Huge \\color{accentcolor} \\textbf{${escapeLatex(b.name)}}} \\\\[4pt]
  ${b.label ? `\\textit{${escapeLatex(b.label)}} \\\\[2pt]` : ''}
  ${contactLine(data)}
\\end{center}

${b.summary ? section('Summary', `\\noindent ${escapeLatex(b.summary)}`) : ''}
${section('Experience', data.work.map(workBlock).join('\n\n'))}
${section('Projects', data.projects.map(projectBlock).join('\n\n'))}
${section('Education', data.education.map(educationBlock).join('\n\n'))}
${section('Skills', skillsBlock(data))}
${section('Awards', awardsBlock(data))}

\\end{document}
`
}

const awesomeCv: TemplateRenderer = {
  id: 'awesome-cv',
  name: 'Awesome-CV (accent)',
  description:
    'Single column with a blue accent on the name and section titles. Visual emphasis without crowding.',
  render(data) {
    return { mainTex: renderMainTex(data), files: [] }
  },
}

export default awesomeCv
