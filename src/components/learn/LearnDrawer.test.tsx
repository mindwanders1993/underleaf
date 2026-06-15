import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LearnDrawer from './LearnDrawer'

describe('LearnDrawer', () => {
  it('returns null when closed', () => {
    const { container } = render(<LearnDrawer open={false} onClose={() => {}} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the post list when open', () => {
    render(<LearnDrawer open onClose={() => {}} />)
    expect(screen.getByTestId('ul-learn-card-harvard-ces')).toBeInTheDocument()
    expect(screen.getByTestId('ul-learn-card-stanford-beam')).toBeInTheDocument()
    expect(screen.getByTestId('ul-learn-card-ai-prompt-cookbook')).toBeInTheDocument()
  })

  it('opens a post and shows the back button', () => {
    render(<LearnDrawer open onClose={() => {}} />)
    fireEvent.click(screen.getByTestId('ul-learn-card-harvard-ces'))
    expect(screen.getByTestId('ul-learn-post-harvard-ces')).toBeInTheDocument()
    expect(screen.getByTestId('ul-learn-back')).toBeInTheDocument()
  })

  it('back returns to the list', () => {
    render(<LearnDrawer open onClose={() => {}} />)
    fireEvent.click(screen.getByTestId('ul-learn-card-harvard-ces'))
    fireEvent.click(screen.getByTestId('ul-learn-back'))
    expect(screen.queryByTestId('ul-learn-post-harvard-ces')).toBeNull()
    expect(screen.getByTestId('ul-learn-card-harvard-ces')).toBeInTheDocument()
  })

  it('Esc closes the drawer', () => {
    const onClose = vi.fn()
    render(<LearnDrawer open onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })
})
