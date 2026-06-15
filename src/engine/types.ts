import type { CompileError, ProjectFile } from '../types/project'

export type EngineStatus = 'unloaded' | 'loading' | 'ready' | 'failed'

export interface LatexCompileInput {
  files: ProjectFile[]
  mainFile: string
}

export interface LatexCompileResult {
  pdfBuffer: Uint8Array | null
  log: string
  errors: CompileError[]
}

export interface LatexEngine {
  readonly status: EngineStatus
  init(): Promise<void>
  compile(input: LatexCompileInput): Promise<LatexCompileResult>
  dispose(): void
}
