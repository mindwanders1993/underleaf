import type { LatexCompileInput, LatexCompileResult, LatexEngine, EngineStatus } from './types'
import { parseLatexLog } from './errorParser'

const ENGINE_SCRIPT_URL = '/swiftlatex/PdfTeXEngine.js'

interface SwiftPdfTeXEngine {
  loadEngine(): Promise<void>
  writeMemFSFile(name: string, content: string | Uint8Array): void
  setEngineMainFile(name: string): void
  compileLaTeX(): Promise<{ pdf: Uint8Array; log: string; status: number }>
  flushCache?(): void
  closeWorker?(): void
}

interface SwiftPdfTeXEngineConstructor {
  new (): SwiftPdfTeXEngine
}

declare global {
  interface Window {
    PdfTeXEngine?: SwiftPdfTeXEngineConstructor
  }
}

async function injectEngineScript(): Promise<SwiftPdfTeXEngineConstructor> {
  if (typeof window === 'undefined') {
    throw new Error('SwiftLaTeX engine requires a browser environment.')
  }
  if (window.PdfTeXEngine) return window.PdfTeXEngine

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${ENGINE_SCRIPT_URL}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('SwiftLaTeX script failed to load')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = ENGINE_SCRIPT_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Could not load ${ENGINE_SCRIPT_URL}. Run "npm run fetch:engine".`))
    document.head.appendChild(script)
  })

  if (!window.PdfTeXEngine) {
    throw new Error('SwiftLaTeX loaded but did not expose window.PdfTeXEngine.')
  }
  return window.PdfTeXEngine
}

export class SwiftLatexEngine implements LatexEngine {
  private engine: SwiftPdfTeXEngine | null = null
  private _status: EngineStatus = 'unloaded'
  private initPromise: Promise<void> | null = null
  private lastBlobUrl: string | null = null

  get status(): EngineStatus {
    return this._status
  }

  async init(): Promise<void> {
    if (this._status === 'ready') return
    if (this.initPromise) return this.initPromise

    this._status = 'loading'
    this.initPromise = (async () => {
      try {
        const Ctor = await injectEngineScript()
        const engine = new Ctor()
        await engine.loadEngine()
        this.engine = engine
        this._status = 'ready'
      } catch (err) {
        this._status = 'failed'
        this.engine = null
        throw err
      } finally {
        this.initPromise = null
      }
    })()

    return this.initPromise
  }

  async compile(input: LatexCompileInput): Promise<LatexCompileResult> {
    await this.init()
    if (!this.engine) {
      throw new Error('SwiftLaTeX engine is not ready.')
    }

    for (const file of input.files) {
      this.engine.writeMemFSFile(file.name, file.content)
    }
    this.engine.setEngineMainFile(input.mainFile)

    const result = await this.engine.compileLaTeX()
    const errors = parseLatexLog(result.log, input.mainFile)
    const succeeded = result.status === 0 && result.pdf?.byteLength > 0

    return {
      pdfBuffer: succeeded ? result.pdf : null,
      log: result.log ?? '',
      errors,
    }
  }

  trackBlobUrl(url: string | null): string | null {
    if (this.lastBlobUrl && this.lastBlobUrl !== url) {
      URL.revokeObjectURL(this.lastBlobUrl)
    }
    this.lastBlobUrl = url
    return url
  }

  dispose(): void {
    if (this.lastBlobUrl) {
      URL.revokeObjectURL(this.lastBlobUrl)
      this.lastBlobUrl = null
    }
    this.engine?.closeWorker?.()
    this.engine = null
    this._status = 'unloaded'
  }
}
