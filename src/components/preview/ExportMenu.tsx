import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Download } from 'lucide-react'
import { useProjectStore } from '../../store/useProjectStore'
import { triggerDownload } from '../../export/download'
import { exportResumeAsPlainText } from '../../export/plainText'
import { toJsonResume } from '../../export/jsonResume'
import './ExportMenu.css'

const ExportMenu = () => {
  const project = useProjectStore((s) => s.currentProject)
  const pdfBlobUrl = useProjectStore((s) => s.compilationState.pdfBlobUrl)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const baseName = project?.id || 'resume'
  const hasResume = project?.mode === 'structured' && !!project.resume
  const hasPdf = !!pdfBlobUrl

  const downloadPdf = async () => {
    if (!pdfBlobUrl) return
    const res = await fetch(pdfBlobUrl)
    const blob = await res.blob()
    triggerDownload(`${baseName}.pdf`, blob, 'application/pdf')
    setOpen(false)
  }

  const downloadPlainText = () => {
    if (!project?.resume) return
    triggerDownload(`${baseName}.txt`, exportResumeAsPlainText(project.resume), 'text/plain')
    setOpen(false)
  }

  const downloadJsonResume = () => {
    if (!project?.resume) return
    const payload = JSON.stringify(toJsonResume(project.resume), null, 2) + '\n'
    triggerDownload(`${baseName}.json`, payload, 'application/json')
    setOpen(false)
  }

  return (
    <div className="ul-export-menu" ref={containerRef} data-testid="ul-export-menu">
      <button
        type="button"
        className="ul-export-menu__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        data-testid="ul-export-trigger"
      >
        <Download size={14} />
        Download
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="ul-export-menu__panel" role="menu" data-testid="ul-export-panel">
          <button
            type="button"
            className="ul-export-menu__item"
            onClick={downloadPdf}
            disabled={!hasPdf}
            role="menuitem"
            data-testid="ul-export-pdf"
          >
            <span className="ul-export-menu__item-label">PDF</span>
            <span className="ul-export-menu__item-hint">
              {hasPdf ? 'Compiled PDF (last successful compile)' : 'Compile first (Cmd/Ctrl + Enter)'}
            </span>
          </button>
          <button
            type="button"
            className="ul-export-menu__item"
            onClick={downloadPlainText}
            disabled={!hasResume}
            role="menuitem"
            data-testid="ul-export-text"
          >
            <span className="ul-export-menu__item-label">ATS plain-text</span>
            <span className="ul-export-menu__item-hint">
              {hasResume ? 'Paste-ready text for ATS forms' : 'Switch to structured mode'}
            </span>
          </button>
          <button
            type="button"
            className="ul-export-menu__item"
            onClick={downloadJsonResume}
            disabled={!hasResume}
            role="menuitem"
            data-testid="ul-export-json"
          >
            <span className="ul-export-menu__item-label">JSON Resume</span>
            <span className="ul-export-menu__item-hint">
              {hasResume ? 'jsonresume.org schema v1.0.0' : 'Switch to structured mode'}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

export default ExportMenu
