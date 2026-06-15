import { describe, it, expect } from 'vitest'
import renderCvModern from './index'
import { sampleResume } from '../sampleResume'

describe('rendercv-modern renderer', () => {
  it('produces a valid document skeleton', () => {
    const { mainTex } = renderCvModern.render(sampleResume)
    expect(mainTex).toContain('\\documentclass')
    expect(mainTex).toContain('\\begin{document}')
    expect(mainTex).toContain('\\end{document}')
  })

  it('uses parskip + lowercase small-caps section headers', () => {
    const { mainTex } = renderCvModern.render(sampleResume)
    expect(mainTex).toContain('\\usepackage{parskip}')
    expect(mainTex).toContain('\\textsc{experience}')
    expect(mainTex).toContain('\\textsc{projects}')
  })

  it('escapes user content', () => {
    const { mainTex } = renderCvModern.render({
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
