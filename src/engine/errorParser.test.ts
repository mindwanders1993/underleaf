import { describe, it, expect } from 'vitest'
import { parseLatexLog } from './errorParser'

describe('parseLatexLog', () => {
  it('returns empty for empty log', () => {
    expect(parseLatexLog('')).toEqual([])
  })

  it('extracts error with line number from following l.N marker', () => {
    const log = ['! Undefined control sequence.', 'l.13 \\foo', '', '? '].join('\n')
    const errs = parseLatexLog(log, 'main.tex')
    expect(errs).toHaveLength(1)
    expect(errs[0]).toMatchObject({ severity: 'error', line: 13, file: 'main.tex' })
    expect(errs[0].message).toMatch(/Undefined control sequence/)
  })

  it('extracts LaTeX Warning lines', () => {
    const log = 'LaTeX Warning: Reference `foo\' on page 1 undefined on input line 5.'
    const errs = parseLatexLog(log)
    expect(errs).toHaveLength(1)
    expect(errs[0].severity).toBe('warning')
  })

  it('attributes error to last pushed file', () => {
    const log = ['(./chapter1.tex', '! Bad.', 'l.7 oh'].join('\n')
    const errs = parseLatexLog(log)
    expect(errs[0].file).toBe('chapter1.tex')
  })
})
