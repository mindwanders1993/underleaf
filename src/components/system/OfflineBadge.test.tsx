import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import OfflineBadge from './OfflineBadge'

const originalDescriptor = Object.getOwnPropertyDescriptor(window.navigator, 'onLine')

function setOnline(value: boolean) {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    get: () => value,
  })
}

beforeEach(() => setOnline(true))
afterEach(() => {
  if (originalDescriptor) Object.defineProperty(window.navigator, 'onLine', originalDescriptor)
})

describe('OfflineBadge', () => {
  it('renders nothing when online', () => {
    setOnline(true)
    const { container } = render(<OfflineBadge />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the badge when offline', () => {
    setOnline(false)
    render(<OfflineBadge />)
    expect(screen.getByTestId('ul-offline-badge')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/offline/i)
  })

  it('hides and shows in response to events', () => {
    setOnline(true)
    render(<OfflineBadge />)
    expect(screen.queryByTestId('ul-offline-badge')).toBeNull()

    act(() => {
      setOnline(false)
      window.dispatchEvent(new Event('offline'))
    })
    expect(screen.getByTestId('ul-offline-badge')).toBeInTheDocument()

    act(() => {
      setOnline(true)
      window.dispatchEvent(new Event('online'))
    })
    expect(screen.queryByTestId('ul-offline-badge')).toBeNull()
  })
})
