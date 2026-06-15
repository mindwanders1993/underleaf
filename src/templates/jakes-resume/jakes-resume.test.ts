import { describe, it, expect } from 'vitest'
import jakesResume from './index'
import { sampleResume } from '../sampleResume'
import type { ResumeData } from '../../types/resume'

describe('jakes-resume renderer', () => {
  it('produces a documentclass and document body', () => {
    const { mainTex, files } = jakesResume.render(sampleResume)
    expect(mainTex).toContain('\\documentclass')
    expect(mainTex).toContain('\\begin{document}')
    expect(mainTex).toContain('\\end{document}')
    expect(files).toEqual([])
  })

  it('includes candidate name, companies, and projects from the sample', () => {
    const { mainTex } = jakesResume.render(sampleResume)
    expect(mainTex).toContain('Jane Doe')
    expect(mainTex).toContain('Acme Corp')
    expect(mainTex).toContain('Initech')
    expect(mainTex).toContain('tex-pdf-diff')
  })

  it('escapes LaTeX special characters in user content', () => {
    const malicious: ResumeData = {
      basics: { name: 'A & B', summary: 'Saved $100% of revenue.' },
      work: [
        {
          company: 'Foo_Bar',
          position: 'Dev',
          highlights: ['Wrote a #1 algorithm.'],
        },
      ],
      education: [],
      projects: [],
      skills: [],
    }
    const { mainTex } = jakesResume.render(malicious)
    expect(mainTex).toContain('A \\& B')
    expect(mainTex).toContain('\\$100\\%')
    expect(mainTex).toContain('Foo\\_Bar')
    expect(mainTex).toContain('\\#1')
    expect(mainTex).not.toContain(' & ')
    expect(mainTex).not.toContain(' % ')
  })

  it('omits sections that have no data', () => {
    const minimal: ResumeData = {
      basics: { name: 'Solo Founder' },
      work: [],
      education: [],
      projects: [],
      skills: [],
    }
    const { mainTex } = jakesResume.render(minimal)
    expect(mainTex).not.toContain('\\section*{Experience}')
    expect(mainTex).not.toContain('\\section*{Projects}')
    expect(mainTex).not.toContain('\\section*{Education}')
    expect(mainTex).not.toContain('\\section*{Skills}')
  })
})
