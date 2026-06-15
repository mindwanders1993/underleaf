import { SwiftLatexEngine } from './swiftLatexEngine'

export type { LatexEngine, LatexCompileInput, LatexCompileResult, EngineStatus } from './types'

let instance: SwiftLatexEngine | null = null

export function getLatexEngine(): SwiftLatexEngine {
  if (!instance) instance = new SwiftLatexEngine()
  return instance
}

export function resetLatexEngine(): void {
  instance?.dispose()
  instance = null
}
