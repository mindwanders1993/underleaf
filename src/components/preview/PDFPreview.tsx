import { useCallback, useEffect, useRef, useState } from 'react'
import { Document, Page } from 'react-pdf'
import { ChevronLeft, ChevronRight, Maximize2, ZoomIn, ZoomOut } from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import './pdfWorker'
import './PDFPreview.css'

const ZOOM_MIN = 0.25
const ZOOM_MAX = 4.0
const ZOOM_STEP = 0.25
const DEFAULT_SCALE = 1.0

interface Props {
  file: string
}

interface DocPaneProps {
  file: string
  scale: number
  fitWidth: boolean
  containerWidth: number
  onPageCount: (n: number) => void
}

// Inner pane is keyed by `file` from the parent so that pageNumber/loadError reset
// naturally on file change while parent-owned scale + fitWidth persist.
const DocPane = ({ file, scale, fitWidth, containerWidth, onPageCount }: DocPaneProps) => {
  const [pageNumber, setPageNumber] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const [loadError, setLoadError] = useState<string | null>(null)

  const clampPage = (n: number) => Math.max(1, Math.min(pageCount || 1, n))

  const onLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setPageCount(numPages)
      setPageNumber((n) => Math.min(n, numPages))
      setLoadError(null)
      onPageCount(numPages)
    },
    [onPageCount],
  )

  const onLoadError = useCallback((err: Error) => setLoadError(err.message), [])

  const pageProps =
    fitWidth && containerWidth > 0 ? { width: containerWidth } : { scale }

  return (
    <>
      <div className="ul-pdf-toolbar__group">
        <button
          type="button"
          onClick={() => setPageNumber((n) => clampPage(n - 1))}
          disabled={pageNumber <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        <input
          className="ul-pdf-toolbar__page-input"
          value={pageNumber}
          onChange={(e) => {
            const parsed = Number.parseInt(e.target.value, 10)
            if (Number.isFinite(parsed)) setPageNumber(clampPage(parsed))
          }}
          aria-label="Page number"
        />
        <span>/ {pageCount || '–'}</span>
        <button
          type="button"
          onClick={() => setPageNumber((n) => clampPage(n + 1))}
          disabled={pageCount === 0 || pageNumber >= pageCount}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {loadError ? (
        <div className="ul-pdf-status" role="alert">
          PDF failed to load: {loadError}
        </div>
      ) : (
        <div className="ul-pdf-canvas__inner">
          <Document
            file={file}
            onLoadSuccess={onLoadSuccess}
            onLoadError={onLoadError}
            loading={<div className="ul-pdf-status">Loading PDF…</div>}
          >
            <Page
              pageNumber={pageNumber}
              {...pageProps}
              renderTextLayer
              renderAnnotationLayer
            />
          </Document>
        </div>
      )}
    </>
  )
}

const PDFPreview = ({ file }: Props) => {
  const [scale, setScale] = useState(DEFAULT_SCALE)
  const [fitWidth, setFitWidth] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)

  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!fitWidth) return
    const el = canvasRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0
      setContainerWidth(Math.max(w - 32, 200))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [fitWidth])

  const clampScale = (s: number) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, s))
  const zoomIn = () => {
    setFitWidth(false)
    setScale((s) => clampScale(s + ZOOM_STEP))
  }
  const zoomOut = () => {
    setFitWidth(false)
    setScale((s) => clampScale(s - ZOOM_STEP))
  }
  const zoomReset = () => {
    setFitWidth(false)
    setScale(DEFAULT_SCALE)
  }

  return (
    <div className="ul-pdf-preview" data-testid="ul-pdf-preview">
      <div className="ul-pdf-toolbar">
        <DocPane
          key={file}
          file={file}
          scale={scale}
          fitWidth={fitWidth}
          containerWidth={containerWidth}
          onPageCount={() => {}}
        />

        <div className="ul-pdf-toolbar__spacer" />

        <div className="ul-pdf-toolbar__group">
          <button
            type="button"
            onClick={zoomOut}
            disabled={scale <= ZOOM_MIN}
            aria-label="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <span
            className="ul-pdf-toolbar__zoom-label"
            onClick={zoomReset}
            title="Reset to 100%"
          >
            {fitWidth ? 'Fit' : `${Math.round(scale * 100)}%`}
          </span>
          <button
            type="button"
            onClick={zoomIn}
            disabled={scale >= ZOOM_MAX}
            aria-label="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            onClick={() => setFitWidth((v) => !v)}
            aria-label="Fit width"
            aria-pressed={fitWidth}
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      <div className="ul-pdf-canvas" ref={canvasRef} />
    </div>
  )
}

export default PDFPreview
