import type { CompileError } from '../types/project'

const ERROR_LINE_RE = /^!\s+(.+)$/
const FILE_LINE_RE = /^l\.(\d+)\s/
const WARNING_RE = /^LaTeX Warning:\s+(.+)$/
const FILE_PUSH_RE = /\(\.?\/?([^()\s]+\.(?:tex|sty|cls|bib))/

export function parseLatexLog(log: string, fallbackFile = 'main.tex'): CompileError[] {
  if (!log) return []

  const lines = log.split(/\r?\n/)
  const errors: CompileError[] = []
  const fileStack: string[] = [fallbackFile]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    const fileMatch = line.match(FILE_PUSH_RE)
    if (fileMatch) fileStack.push(fileMatch[1])

    const errMatch = line.match(ERROR_LINE_RE)
    if (errMatch) {
      const message = errMatch[1].trim()
      let lineNumber = 0
      for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
        const lm = lines[j].match(FILE_LINE_RE)
        if (lm) {
          lineNumber = Number(lm[1])
          break
        }
      }
      errors.push({
        line: lineNumber,
        message,
        file: fileStack[fileStack.length - 1] ?? fallbackFile,
        severity: 'error',
      })
      continue
    }

    const warnMatch = line.match(WARNING_RE)
    if (warnMatch) {
      errors.push({
        line: 0,
        message: warnMatch[1].trim(),
        file: fileStack[fileStack.length - 1] ?? fallbackFile,
        severity: 'warning',
      })
    }
  }

  return errors
}
