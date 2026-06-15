import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FileTree from './FileTree'
import { useProjectStore } from '../../store/useProjectStore'
import type { Project } from '../../types/project'

const fixture: Project = {
  id: 'fx',
  name: 'fx',
  mainFile: 'main.tex',
  mode: 'raw',
  files: [
    { name: 'main.tex', type: 'tex', content: 'A' },
    { name: 'chapter.tex', type: 'tex', content: 'B' },
    { name: 'refs.bib', type: 'bib', content: 'C' },
  ],
}

beforeEach(() => {
  useProjectStore.setState({ currentProject: structuredClone(fixture) })
})

describe('FileTree', () => {
  it('renders a row per file and marks the main file active', () => {
    render(<FileTree />)
    expect(screen.getByText('main.tex')).toBeInTheDocument()
    expect(screen.getByText('chapter.tex')).toBeInTheDocument()
    expect(screen.getByText('refs.bib')).toBeInTheDocument()

    const activeRow = screen.getByText('main.tex').closest('.ul-file-tree__row')!
    expect(activeRow).toHaveAttribute('data-active', 'true')
  })

  it('clicking a tex file sets it as mainFile', () => {
    render(<FileTree />)
    fireEvent.click(screen.getByText('chapter.tex'))
    expect(useProjectStore.getState().currentProject!.mainFile).toBe('chapter.tex')
  })

  it('creating a new file appears in the store', () => {
    render(<FileTree />)
    fireEvent.click(screen.getByLabelText('New file'))
    const input = screen.getByLabelText('New file name') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'intro.tex' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    const names = useProjectStore.getState().currentProject!.files.map((f) => f.name)
    expect(names).toContain('intro.tex')
  })

  it('rejects duplicate file names with inline error', () => {
    render(<FileTree />)
    fireEvent.click(screen.getByLabelText('New file'))
    const input = screen.getByLabelText('New file name') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'main.tex' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(screen.getByRole('alert')).toHaveTextContent(/already exists/i)
    expect(useProjectStore.getState().currentProject!.files).toHaveLength(3)
  })

  it('renames via context menu', () => {
    render(<FileTree />)
    fireEvent.contextMenu(screen.getByText('chapter.tex'))
    fireEvent.click(screen.getByRole('menuitem', { name: /rename/i }))
    const input = screen.getByLabelText(/Rename chapter\.tex/) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'chapter-renamed.tex' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    const names = useProjectStore.getState().currentProject!.files.map((f) => f.name)
    expect(names).toContain('chapter-renamed.tex')
    expect(names).not.toContain('chapter.tex')
  })

  it('deletes via context menu after confirm', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<FileTree />)
    fireEvent.contextMenu(screen.getByText('refs.bib'))
    fireEvent.click(screen.getByRole('menuitem', { name: /delete/i }))
    confirmSpy.mockRestore()

    const names = useProjectStore.getState().currentProject!.files.map((f) => f.name)
    expect(names).not.toContain('refs.bib')
  })

  it('renders capacity footer with percent label', () => {
    render(<FileTree />)
    const footer = screen.getByTestId('ul-file-tree-footer')
    expect(footer).toBeInTheDocument()
    expect(footer.textContent).toMatch(/%/)
    expect(footer.textContent).toMatch(/limit/)
  })

  it('switch-to-structured seeds resume + template, eject round-trips', () => {
    render(<FileTree />)
    const toggle = screen.getByTestId('ul-mode-toggle')
    expect(toggle).toHaveTextContent(/structured/i)
    fireEvent.click(toggle)

    const after = useProjectStore.getState().currentProject!
    expect(after.mode).toBe('structured')
    expect(after.resume?.basics.name).toBeTruthy()
    expect(after.templateId).toBe('jakes-resume')

    const ejectBtn = screen.getByTestId('ul-mode-toggle')
    expect(ejectBtn).toHaveTextContent(/eject/i)
    fireEvent.click(ejectBtn)

    const ejected = useProjectStore.getState().currentProject!
    expect(ejected.mode).toBe('raw')
    expect(ejected.resume).toBeUndefined()
    const mainTex = ejected.files.find((f) => f.name === 'main.tex')!.content
    expect(mainTex).toContain('\\documentclass')
  })

  it('Browse templates opens picker; picking from raw mode flips to structured + sets templateId', () => {
    render(<FileTree />)
    fireEvent.click(screen.getByTestId('ul-templates-btn'))
    const deedyCard = screen.getByText(/Deedy/i).closest('button[data-template-id]')!
    fireEvent.click(deedyCard)

    const after = useProjectStore.getState().currentProject!
    expect(after.mode).toBe('structured')
    expect(after.templateId).toBe('deedy-cv')
    expect(after.resume?.basics.name).toBeTruthy()
  })

  it('Browse templates while in structured mode updates only templateId', () => {
    render(<FileTree />)
    fireEvent.click(screen.getByTestId('ul-mode-toggle'))
    expect(useProjectStore.getState().currentProject!.templateId).toBe('jakes-resume')

    fireEvent.click(screen.getByTestId('ul-templates-btn'))
    const awesomeCard = screen.getByText(/Awesome-CV/i).closest('button[data-template-id]')!
    fireEvent.click(awesomeCard)

    expect(useProjectStore.getState().currentProject!.templateId).toBe('awesome-cv')
    expect(useProjectStore.getState().currentProject!.mode).toBe('structured')
  })

  it('AI Assist button opens the drawer', () => {
    render(<FileTree />)
    fireEvent.click(screen.getByTestId('ul-assistant-btn'))
    expect(screen.getByTestId('ul-assistant')).toBeInTheDocument()
  })
})
