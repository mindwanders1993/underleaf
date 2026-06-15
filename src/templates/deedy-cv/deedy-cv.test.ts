import { describe, it, expect } from 'vitest'
import deedyCv from './index'
import { sampleResume } from '../sampleResume'

describe('deedy-cv renderer', () => {
  it('produces a valid document skeleton', () => {
    const { mainTex } = deedyCv.render(sampleResume)
    expect(mainTex).toContain('\\documentclass')
    expect(mainTex).toContain('\\begin{document}')
    expect(mainTex).toContain('\\end{document}')
  })

  it('uses two-column minipage layout', () => {
    const { mainTex } = deedyCv.render(sampleResume)
    expect(mainTex).toContain('\\begin{minipage}[t]{0.30\\textwidth}')
    expect(mainTex).toContain('\\begin{minipage}[t]{0.66\\textwidth}')
  })

  it('escapes user content', () => {
    const { mainTex } = deedyCv.render({
      basics: { name: 'A & B' },
      work: [{ company: 'Foo_Bar', position: 'Dev' }],
      education: [],
      projects: [],
      skills: [],
    })
    expect(mainTex).toContain('A \\& B')
    expect(mainTex).toContain('Foo\\_Bar')
  })
})
