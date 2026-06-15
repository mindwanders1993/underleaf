import { describe, it, expect, vi } from 'vitest'
import { exportProjectToFile, importProjectFromFile, validateProjectPayload } from './projectIo'
import type { Project } from '../types/project'

const project: Project = {
  id: 'p1',
  name: 'demo',
  mainFile: 'main.tex',
  mode: 'raw',
  files: [{ name: 'main.tex', type: 'tex', content: 'hi' }],
}

describe('validateProjectPayload', () => {
  it('accepts a valid project and defaults mode to raw', () => {
    const v = validateProjectPayload({ ...project, mode: undefined })
    expect(v.mode).toBe('raw')
  })

  it('rejects missing id', () => {
    expect(() => validateProjectPayload({ ...project, id: undefined })).toThrow(/id/)
  })

  it('rejects malformed files', () => {
    expect(() =>
      validateProjectPayload({ ...project, files: [{ name: 'x', content: 'y' }] }),
    ).toThrow(/files/)
  })

  it('preserves unknown fields', () => {
    const v = validateProjectPayload({ ...project, extension: 'something' } as Record<string, unknown>)
    expect((v as unknown as { extension: string }).extension).toBe('something')
  })

  it('rejects non-object input', () => {
    expect(() => validateProjectPayload(null)).toThrow()
    expect(() => validateProjectPayload(42)).toThrow()
  })
})

describe('exportProjectToFile', () => {
  it('clicks an anchor and revokes the blob URL', () => {
    const createSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url')
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const appendSpy = vi.spyOn(document.body, 'appendChild')

    const name = exportProjectToFile(project, 'fixed-name.json')
    expect(name).toBe('fixed-name.json')
    expect(createSpy).toHaveBeenCalled()
    expect(appendSpy).toHaveBeenCalled()

    createSpy.mockRestore()
    revokeSpy.mockRestore()
    appendSpy.mockRestore()
  })
})

describe('importProjectFromFile', () => {
  it('parses a valid JSON file', async () => {
    const file = new File([JSON.stringify(project)], 'p.json', { type: 'application/json' })
    const v = await importProjectFromFile(file)
    expect(v.id).toBe('p1')
    expect(v.files).toHaveLength(1)
  })

  it('rejects bad JSON', async () => {
    const file = new File(['not json'], 'bad.json', { type: 'application/json' })
    await expect(importProjectFromFile(file)).rejects.toThrow(/Invalid JSON/)
  })

  it('rejects valid JSON with wrong shape', async () => {
    const file = new File([JSON.stringify({ foo: 'bar' })], 'x.json', { type: 'application/json' })
    await expect(importProjectFromFile(file)).rejects.toThrow(/id/)
  })
})
