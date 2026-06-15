import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TemplatePickerModal from './TemplatePickerModal'

describe('TemplatePickerModal', () => {
  it('renders a card per registered template', () => {
    render(<TemplatePickerModal open selectedId={null} onPick={() => {}} onClose={() => {}} />)
    expect(screen.getByText(/Jake's Resume/i)).toBeInTheDocument()
    expect(screen.getByText(/Deedy/i)).toBeInTheDocument()
    expect(screen.getByText(/Awesome-CV/i)).toBeInTheDocument()
    expect(screen.getByText(/RenderCV Modern/i)).toBeInTheDocument()
  })

  it('marks the selected template', () => {
    render(
      <TemplatePickerModal open selectedId="awesome-cv" onPick={() => {}} onClose={() => {}} />,
    )
    const awesomeCard = screen.getByText(/Awesome-CV/i).closest('button[data-template-id]')!
    expect(awesomeCard).toHaveAttribute('data-selected', 'true')
    expect(awesomeCard).toHaveTextContent(/selected/i)
  })

  it('calls onPick when a card is clicked', () => {
    const onPick = vi.fn()
    render(<TemplatePickerModal open selectedId={null} onPick={onPick} onClose={() => {}} />)
    fireEvent.click(screen.getByText(/Deedy/i).closest('button[data-template-id]')!)
    expect(onPick).toHaveBeenCalledWith('deedy-cv')
  })

  it('calls onClose on backdrop click and Escape key', () => {
    const onClose = vi.fn()
    render(<TemplatePickerModal open selectedId={null} onPick={() => {}} onClose={onClose} />)
    fireEvent.click(screen.getByTestId('ul-template-modal-backdrop'))
    expect(onClose).toHaveBeenCalled()

    onClose.mockClear()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('returns null when closed', () => {
    const { container } = render(
      <TemplatePickerModal open={false} selectedId={null} onPick={() => {}} onClose={() => {}} />,
    )
    expect(container.firstChild).toBeNull()
  })
})
