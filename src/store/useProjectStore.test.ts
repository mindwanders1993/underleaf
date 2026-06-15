import { describe, it, expect, beforeEach } from 'vitest'
import { useProjectStore } from './useProjectStore'
import { sampleResume } from '../templates/sampleResume'
import { DEFAULT_TEMPLATE_ID } from '../templates'
import type { Project } from '../types/project'

const baseline: Project = {
  id: 'fx',
  name: 'fx',
  mainFile: 'main.tex',
  mode: 'raw',
  files: [{ name: 'main.tex', type: 'tex', content: '\\documentclass{article}\\begin{document}hi\\end{document}' }],
}

beforeEach(() => {
  useProjectStore.setState({ currentProject: structuredClone(baseline) })
})

describe('useProjectStore — structured mode (Module 5)', () => {
  it('setMainFile validates file exists', () => {
    useProjectStore.getState().setMainFile('missing.tex')
    expect(useProjectStore.getState().currentProject!.mainFile).toBe('main.tex')
  })

  it('setProjectMode("structured") seeds resume + template when absent', () => {
    useProjectStore.getState().setProjectMode('structured', sampleResume, DEFAULT_TEMPLATE_ID)
    const p = useProjectStore.getState().currentProject!
    expect(p.mode).toBe('structured')
    expect(p.resume?.basics.name).toBe(sampleResume.basics.name)
    expect(p.templateId).toBe(DEFAULT_TEMPLATE_ID)
  })

  it('setProjectMode("structured") does not clobber existing resume', () => {
    useProjectStore.setState({
      currentProject: { ...baseline, resume: { ...sampleResume, basics: { name: 'Pre' } } },
    })
    useProjectStore.getState().setProjectMode('structured', sampleResume, DEFAULT_TEMPLATE_ID)
    expect(useProjectStore.getState().currentProject!.resume!.basics.name).toBe('Pre')
  })

  it('updateResume merges patches', () => {
    useProjectStore.getState().setProjectMode('structured', sampleResume, DEFAULT_TEMPLATE_ID)
    useProjectStore.getState().updateResume({ basics: { name: 'Patched Name' } })
    expect(useProjectStore.getState().currentProject!.resume!.basics.name).toBe('Patched Name')
  })

  it('setTemplate updates the template id', () => {
    useProjectStore.getState().setTemplate('jakes-resume')
    expect(useProjectStore.getState().currentProject!.templateId).toBe('jakes-resume')
  })

  it('ejectToRaw renders template, replaces files, flips mode, clears resume', () => {
    useProjectStore.getState().setProjectMode('structured', sampleResume, DEFAULT_TEMPLATE_ID)
    useProjectStore.getState().ejectToRaw()
    const p = useProjectStore.getState().currentProject!
    expect(p.mode).toBe('raw')
    expect(p.mainFile).toBe('main.tex')
    expect(p.resume).toBeUndefined()
    expect(p.templateId).toBeUndefined()
    expect(p.files.find((f) => f.name === 'main.tex')!.content).toContain(sampleResume.basics.name)
  })

  it('ejectToRaw is a no-op when not in structured mode', () => {
    const before = structuredClone(useProjectStore.getState().currentProject!)
    useProjectStore.getState().ejectToRaw()
    expect(useProjectStore.getState().currentProject).toEqual(before)
  })
})
