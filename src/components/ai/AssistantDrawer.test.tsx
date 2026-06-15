import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AssistantDrawer from './AssistantDrawer'
import { useProjectStore } from '../../store/useProjectStore'
import { sampleResume } from '../../templates/sampleResume'

beforeEach(() => {
  useProjectStore.setState({
    currentProject: {
      id: 'fx',
      name: 'fx',
      mode: 'structured',
      mainFile: 'main.tex',
      files: [],
      resume: sampleResume,
      templateId: 'jakes-resume',
    },
    llmSettings: { provider: 'gemini', model: 'gemini-2.5-flash' },
  })
})

describe('AssistantDrawer', () => {
  it('renders null when closed', () => {
    const { container } = render(<AssistantDrawer open={false} onClose={() => {}} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows ATS hints by default in structured mode', () => {
    render(<AssistantDrawer open onClose={() => {}} />)
    expect(screen.getByTestId('ul-assistant')).toBeInTheDocument()
    expect(screen.getByTestId('ul-tab-ats')).toHaveAttribute('aria-selected', 'true')
  })

  it('switches between tabs', () => {
    render(<AssistantDrawer open onClose={() => {}} />)
    fireEvent.click(screen.getByTestId('ul-tab-jd'))
    expect(screen.getByTestId('ul-jd-panel')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('ul-tab-settings'))
    expect(screen.getByTestId('ul-llm-settings')).toBeInTheDocument()
  })

  it('disables Analyze when LLM is not configured', () => {
    render(<AssistantDrawer open onClose={() => {}} />)
    fireEvent.click(screen.getByTestId('ul-tab-jd'))
    fireEvent.change(screen.getByTestId('ul-jd-textarea'), { target: { value: 'Sample JD' } })
    expect(screen.getByTestId('ul-jd-analyze')).toBeDisabled()
  })

  it('shows raw-mode stub when project is in raw mode', () => {
    useProjectStore.setState({
      currentProject: {
        id: 'fx',
        name: 'fx',
        mode: 'raw',
        mainFile: 'main.tex',
        files: [{ name: 'main.tex', type: 'tex', content: 'x' }],
      },
    })
    render(<AssistantDrawer open onClose={() => {}} />)
    expect(screen.getByTestId('ul-assistant-stub')).toBeInTheDocument()
  })

  it('calls onClose on Escape', () => {
    const onClose = vi.fn()
    render(<AssistantDrawer open onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })
})
