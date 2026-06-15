import { describe, it, expect } from 'vitest'
import { escapeLatex } from './escapeLatex'

describe('escapeLatex', () => {
  it('returns empty string for null/undefined', () => {
    expect(escapeLatex(null)).toBe('')
    expect(escapeLatex(undefined)).toBe('')
  })

  it('leaves safe text untouched', () => {
    expect(escapeLatex('Hello world.')).toBe('Hello world.')
  })

  it('escapes every special character', () => {
    expect(escapeLatex('& % $ # _ { } ~')).toBe(
      '\\& \\% \\$ \\# \\_ \\{ \\} \\~{}',
    )
  })

  it('escapes backslash first to avoid double-escaping', () => {
    expect(escapeLatex('\\foo')).toBe('\\textbackslash{}foo')
  })

  it('handles caret', () => {
    expect(escapeLatex('x^2')).toBe('x\\^{}2')
  })
})
