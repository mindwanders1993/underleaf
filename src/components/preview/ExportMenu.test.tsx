import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ExportMenu from './ExportMenu'
import { useProjectStore } from '../../store/useProjectStore'
import { sampleResume } from '../../templates/sampleResume'

beforeEach(() => {
  useProjectStore.setState({
    currentProject: {
      id: 'demo',
      name: 'demo',
      mode: 'structured',
      mainFile: 'main.tex',
      files: [],
      resume: sampleResume,
      templateId: 'jakes-resume',
    },
    compilationState: { status: 'SUCCESS', pdfBlobUrl: 'blob:pdf', logs: [], errors: [] },
  })
})

describe('ExportMenu', () => {
  it('opens the panel on trigger click', () => {
    render(<ExportMenu />)
    expect(screen.queryByTestId('ul-export-panel')).toBeNull()
    fireEvent.click(screen.getByTestId('ul-export-trigger'))
    expect(screen.getByTestId('ul-export-panel')).toBeInTheDocument()
  })

  it('all three exports enabled in structured mode with pdfBlobUrl', () => {
    render(<ExportMenu />)
    fireEvent.click(screen.getByTestId('ul-export-trigger'))
    expect(screen.getByTestId('ul-export-pdf')).not.toBeDisabled()
    expect(screen.getByTestId('ul-export-text')).not.toBeDisabled()
    expect(screen.getByTestId('ul-export-json')).not.toBeDisabled()
  })

  it('disables structured exports in raw mode and PDF when no blob', () => {
    useProjectStore.setState({
      currentProject: {
        id: 'demo',
        name: 'demo',
        mode: 'raw',
        mainFile: 'main.tex',
        files: [{ name: 'main.tex', type: 'tex', content: 'hi' }],
      },
      compilationState: { status: 'IDLE', pdfBlobUrl: null, logs: [], errors: [] },
    })
    render(<ExportMenu />)
    fireEvent.click(screen.getByTestId('ul-export-trigger'))
    expect(screen.getByTestId('ul-export-pdf')).toBeDisabled()
    expect(screen.getByTestId('ul-export-text')).toBeDisabled()
    expect(screen.getByTestId('ul-export-json')).toBeDisabled()
  })

  it('plain-text click triggers a download anchor', async () => {
    const createSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:txt')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    render(<ExportMenu />)
    fireEvent.click(screen.getByTestId('ul-export-trigger'))
    fireEvent.click(screen.getByTestId('ul-export-text'))
    await waitFor(() => expect(createSpy).toHaveBeenCalled())
    createSpy.mockRestore()
  })

  it('Esc closes the menu', () => {
    render(<ExportMenu />)
    fireEvent.click(screen.getByTestId('ul-export-trigger'))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByTestId('ul-export-panel')).toBeNull()
  })
})
