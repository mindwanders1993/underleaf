import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import BackupModal from './BackupModal'
import { useProjectStore } from '../../store/useProjectStore'
import type { Project } from '../../types/project'

const fixture: Project = {
  id: 'fx',
  name: 'fx',
  mainFile: 'main.tex',
  mode: 'raw',
  files: [{ name: 'main.tex', type: 'tex', content: 'hi' }],
}

beforeEach(() => {
  useProjectStore.setState({ currentProject: structuredClone(fixture) })
})

describe('BackupModal', () => {
  it('returns null when closed', () => {
    const { container } = render(<BackupModal open={false} onClose={() => {}} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the three action rows', () => {
    render(<BackupModal open onClose={() => {}} />)
    expect(screen.getByTestId('ul-backup-export')).toBeInTheDocument()
    expect(screen.getByTestId('ul-backup-import')).toBeInTheDocument()
    expect(screen.getByTestId('ul-backup-cloud')).toBeDisabled()
  })

  it('export click triggers a download anchor', () => {
    const createSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    render(<BackupModal open onClose={() => {}} />)
    fireEvent.click(screen.getByTestId('ul-backup-export'))
    expect(createSpy).toHaveBeenCalled()
    expect(screen.getByRole('status').textContent).toMatch(/Saved/)
    createSpy.mockRestore()
  })

  it('import file picker loads the project into store', async () => {
    render(<BackupModal open onClose={() => {}} />)
    const input = screen.getByTestId('ul-backup-file-input') as HTMLInputElement
    const newProject = { ...fixture, id: 'imported', name: 'imported demo' }
    const file = new File([JSON.stringify(newProject)], 'p.json', { type: 'application/json' })
    Object.defineProperty(input, 'files', { value: [file] })
    fireEvent.change(input)
    await waitFor(() => {
      expect(useProjectStore.getState().currentProject!.id).toBe('imported')
    })
    expect(screen.getByRole('status').textContent).toMatch(/Imported/)
  })

  it('shows error on bad import payload', async () => {
    render(<BackupModal open onClose={() => {}} />)
    const input = screen.getByTestId('ul-backup-file-input') as HTMLInputElement
    const file = new File(['{}'], 'bad.json', { type: 'application/json' })
    Object.defineProperty(input, 'files', { value: [file] })
    fireEvent.change(input)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(useProjectStore.getState().currentProject!.id).toBe('fx')
  })

  it('Esc closes the modal', () => {
    const onClose = vi.fn()
    render(<BackupModal open onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })
})
