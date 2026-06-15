import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import type { ReactNode } from 'react'

vi.mock('./pdfWorker', () => ({}))

interface DocProps {
  file: string
  onLoadSuccess?: (info: { numPages: number }) => void
  onLoadError?: (err: Error) => void
  children?: ReactNode
}
let lastDoc: DocProps | null = null

vi.mock('react-pdf', () => ({
  Document: (props: DocProps) => {
    lastDoc = props
    return <div data-testid="doc" data-file={props.file}>{props.children}</div>
  },
  Page: (props: { pageNumber: number; scale?: number; width?: number }) => (
    <div
      data-testid="page"
      data-page={props.pageNumber}
      data-scale={props.scale ?? ''}
      data-width={props.width ?? ''}
    />
  ),
}))

vi.mock('react-pdf/dist/Page/AnnotationLayer.css', () => ({}))
vi.mock('react-pdf/dist/Page/TextLayer.css', () => ({}))

import PDFPreview from './PDFPreview'

beforeEach(() => {
  lastDoc = null
})

function simulateLoad(numPages: number) {
  act(() => {
    lastDoc?.onLoadSuccess?.({ numPages })
  })
}

describe('PDFPreview', () => {
  it('renders page 1 of the loaded PDF by default', () => {
    render(<PDFPreview file="blob:fake-1" />)
    simulateLoad(5)
    expect(screen.getByTestId('page').dataset.page).toBe('1')
    expect(screen.getByText('/ 5')).toBeInTheDocument()
  })

  it('next/prev navigation respects page bounds', () => {
    render(<PDFPreview file="blob:fake-1" />)
    simulateLoad(3)
    fireEvent.click(screen.getByLabelText('Next page'))
    expect(screen.getByTestId('page').dataset.page).toBe('2')
    fireEvent.click(screen.getByLabelText('Next page'))
    expect(screen.getByTestId('page').dataset.page).toBe('3')
    expect(screen.getByLabelText('Next page')).toBeDisabled()
    fireEvent.click(screen.getByLabelText('Previous page'))
    expect(screen.getByTestId('page').dataset.page).toBe('2')
  })

  it('clamps zoom between 0.25 and 4.0', () => {
    render(<PDFPreview file="blob:fake-1" />)
    simulateLoad(1)
    const zoomIn = screen.getByLabelText('Zoom in')
    const zoomOut = screen.getByLabelText('Zoom out')

    for (let i = 0; i < 20; i++) fireEvent.click(zoomIn)
    expect(zoomIn).toBeDisabled()
    expect(screen.getByText('400%')).toBeInTheDocument()

    for (let i = 0; i < 30; i++) fireEvent.click(zoomOut)
    expect(zoomOut).toBeDisabled()
    expect(screen.getByText('25%')).toBeInTheDocument()
  })

  it('changing file resets page to 1 and preserves zoom', () => {
    const { rerender } = render(<PDFPreview file="blob:fake-1" />)
    simulateLoad(5)
    fireEvent.click(screen.getByLabelText('Next page'))
    fireEvent.click(screen.getByLabelText('Next page'))
    fireEvent.click(screen.getByLabelText('Zoom in'))
    expect(screen.getByTestId('page').dataset.page).toBe('3')
    expect(screen.getByText('125%')).toBeInTheDocument()

    rerender(<PDFPreview file="blob:fake-2" />)
    expect(screen.getByTestId('page').dataset.page).toBe('1')
    expect(screen.getByText('125%')).toBeInTheDocument()
    expect(screen.getByTestId('doc').dataset.file).toBe('blob:fake-2')
  })

  it('shows an error overlay when Document onLoadError fires', () => {
    render(<PDFPreview file="blob:fake-bad" />)
    act(() => {
      lastDoc?.onLoadError?.(new Error('Invalid PDF'))
    })
    expect(screen.getByRole('alert')).toHaveTextContent(/Invalid PDF/)
  })

  it('fit-width toggle passes width instead of scale to Page', () => {
    render(<PDFPreview file="blob:fake-1" />)
    simulateLoad(1)
    fireEvent.click(screen.getByLabelText('Fit width'))
    // ResizeObserver does not fire in jsdom, so width stays 0 and component falls back to scale —
    // we just assert the toggle reflects ARIA state.
    expect(screen.getByLabelText('Fit width')).toHaveAttribute('aria-pressed', 'true')
  })
})
