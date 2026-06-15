import { useEffect, useRef } from 'react'
import { useProjectStore } from '../store/useProjectStore'
import { getLatexEngine } from '../engine'
import { getTemplate } from '../templates'
import type { ProjectFile } from '../types/project'

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
    if (!current) {
      setCompilationResult(null, ['No project loaded.'], [])
      return
    }

    let filesForEngine: ProjectFile[] = current.files
    let mainForEngine = current.mainFile

    if (current.mode === 'structured') {
      const template = getTemplate(current.templateId)
      if (!template || !current.resume) {
        setCompilationResult(
          null,
          ['Structured project missing template or resume data.'],
          [
            {
              line: 0,
              message: 'Structured project missing template or resume data.',
              file: 'main.tex',
              severity: 'error',
            },
          ],
        )
        setCompileStatus('ERROR')
        return
      }
      const rendered = template.render(current.resume)
      const mainTex: ProjectFile = { name: 'main.tex', type: 'tex', content: rendered.mainTex }
      filesForEngine = [mainTex, ...rendered.files.filter((f) => f.name !== 'main.tex')]
      mainForEngine = 'main.tex'
    }

    if (!mainForEngine) {
      setCompilationResult(null, ['No main file selected.'], [])
      return
    }

    inflightRef.current = true
    const engine = getLatexEngine()
    ;(async () => {
      try {
        const result = await engine.compile({
          files: filesForEngine,
          mainFile: mainForEngine,
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
          [{ line: 0, message, file: mainForEngine, severity: 'error' }],
        )
        setCompileStatus('ERROR')
      } finally {
        inflightRef.current = false
      }
    })()
  }, [status, setCompilationResult, setCompileStatus])
}
