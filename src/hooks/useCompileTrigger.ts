import { useEffect, useRef } from 'react'
import { useProjectStore } from '../store/useProjectStore'
import { getLatexEngine } from '../engine'

export function useCompileTrigger(): void {
  const status = useProjectStore((s) => s.compilationState.status)
  const project = useProjectStore((s) => s.currentProject)
  const setCompilationResult = useProjectStore((s) => s.setCompilationResult)
  const setCompileStatus = useProjectStore((s) => s.setCompileStatus)

  const inflightRef = useRef(false)
  const projectRef = useRef(project)
  useEffect(() => {
    projectRef.current = project
  }, [project])

  useEffect(() => {
    if (status !== 'COMPILING' || inflightRef.current) return
    const current = projectRef.current
    if (!current || !current.mainFile) {
      setCompilationResult(null, ['No main file selected.'], [])
      return
    }

    inflightRef.current = true
    const engine = getLatexEngine()
    ;(async () => {
      try {
        const result = await engine.compile({
          files: current.files,
          mainFile: current.mainFile,
        })

        let blobUrl: string | null = null
        if (result.pdfBuffer) {
          const blob = new Blob([new Uint8Array(result.pdfBuffer)], { type: 'application/pdf' })
          blobUrl = engine.trackBlobUrl(URL.createObjectURL(blob))
        } else {
          engine.trackBlobUrl(null)
        }

        setCompilationResult(blobUrl, result.log.split('\n'), result.errors)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        setCompilationResult(
          null,
          [message],
          [{ line: 0, message, file: current.mainFile, severity: 'error' }],
        )
        setCompileStatus('ERROR')
      } finally {
        inflightRef.current = false
      }
    })()
  }, [status, setCompilationResult, setCompileStatus])
}
