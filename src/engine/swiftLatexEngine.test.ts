import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { SwiftLatexEngine } from './swiftLatexEngine'

interface FakeCompileResult {
  pdf: Uint8Array
  log: string
  status: number
}

class FakePdfTeXEngine {
  static loadCalls = 0
  static instances: FakePdfTeXEngine[] = []

  writes: Array<[string, string]> = []
  mainFile: string | null = null
  nextResult: FakeCompileResult = {
    pdf: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
    log: '',
    status: 0,
  }

  constructor() {
    FakePdfTeXEngine.instances.push(this)
  }

  async loadEngine(): Promise<void> {
    FakePdfTeXEngine.loadCalls++
  }

  writeMemFSFile(name: string, content: string): void {
    this.writes.push([name, content])
  }

  setEngineMainFile(name: string): void {
    this.mainFile = name
  }

  async compileLaTeX() {
    return this.nextResult
  }
}

describe('SwiftLatexEngine', () => {
  let originalCreate: typeof URL.createObjectURL
  let originalRevoke: typeof URL.revokeObjectURL

  beforeEach(() => {
    FakePdfTeXEngine.loadCalls = 0
    FakePdfTeXEngine.instances = []
    vi.stubGlobal('window', { PdfTeXEngine: FakePdfTeXEngine })
    vi.stubGlobal('document', {})

    originalCreate = URL.createObjectURL
    originalRevoke = URL.revokeObjectURL
    let counter = 0
    URL.createObjectURL = vi.fn(() => `blob:fake-${++counter}`)
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    URL.createObjectURL = originalCreate
    URL.revokeObjectURL = originalRevoke
    vi.unstubAllGlobals()
  })

  it('loads engine once across multiple compiles', async () => {
    const engine = new SwiftLatexEngine()
    await engine.compile({ files: [{ name: 'main.tex', content: 'hi', type: 'tex' }], mainFile: 'main.tex' })
    await engine.compile({ files: [{ name: 'main.tex', content: 'hi again', type: 'tex' }], mainFile: 'main.tex' })
    expect(FakePdfTeXEngine.loadCalls).toBe(1)
    expect(engine.status).toBe('ready')
  })

  it('writes every project file then sets main file', async () => {
    const engine = new SwiftLatexEngine()
    await engine.compile({
      files: [
        { name: 'main.tex', content: 'A', type: 'tex' },
        { name: 'refs.bib', content: 'B', type: 'bib' },
      ],
      mainFile: 'main.tex',
    })
    const fake = FakePdfTeXEngine.instances[0]
    expect(fake.writes).toEqual([
      ['main.tex', 'A'],
      ['refs.bib', 'B'],
    ])
    expect(fake.mainFile).toBe('main.tex')
  })

  it('returns null pdfBuffer when status is non-zero', async () => {
    const engine = new SwiftLatexEngine()
    await engine.compile({ files: [{ name: 'main.tex', content: '', type: 'tex' }], mainFile: 'main.tex' })
    const fake = FakePdfTeXEngine.instances[0]
    fake.nextResult = { pdf: new Uint8Array(), log: '! Emergency stop.\nl.42 trouble', status: 1 }
    const result = await engine.compile({ files: [{ name: 'main.tex', content: '', type: 'tex' }], mainFile: 'main.tex' })
    expect(result.pdfBuffer).toBeNull()
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0].severity).toBe('error')
    expect(result.errors[0].line).toBe(42)
  })

  it('revokes previous blob URL when tracking a new one', () => {
    const engine = new SwiftLatexEngine()
    engine.trackBlobUrl('blob:first')
    engine.trackBlobUrl('blob:second')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:first')
  })

  it('dispose revokes the last URL and resets status', async () => {
    const engine = new SwiftLatexEngine()
    await engine.compile({ files: [{ name: 'main.tex', content: '', type: 'tex' }], mainFile: 'main.tex' })
    engine.trackBlobUrl('blob:final')
    engine.dispose()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:final')
    expect(engine.status).toBe('unloaded')
  })
})
