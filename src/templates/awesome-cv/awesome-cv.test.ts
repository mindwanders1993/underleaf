import { describe, it, expect } from 'vitest'
import awesomeCv from './index'
import { sampleResume } from '../sampleResume'

describe('awesome-cv renderer', () => {
  it('produces a valid document skeleton', () => {
    const { mainTex } = awesomeCv.render(sampleResume)
    expect(mainTex).toContain('\\documentclass')
    expect(mainTex).toContain('\\begin{document}')
    expect(mainTex).toContain('\\end{document}')
  })

  it('defines and uses an accent color', () => {
    const { mainTex } = awesomeCv.render(sampleResume)
    expect(mainTex).toContain('\\definecolor{accentcolor}')
    expect(mainTex).toContain('\\color{accentcolor}')
  })

  it('escapes user content', () => {
    const { mainTex } = awesomeCv.render({
      basics: { name: 'A & B', summary: '$100% retention' },
      work: [],
      education: [],
      projects: [],
      skills: [],
    })
    expect(mainTex).toContain('A \\& B')
    expect(mainTex).toContain('\\$100\\%')
  })
})
