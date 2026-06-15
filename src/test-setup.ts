import '@testing-library/jest-dom/vitest'
import { beforeEach } from 'vitest'

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver
}

class MemoryStorage implements Storage {
  private store = new Map<string, string>()
  get length(): number {
    return this.store.size
  }
  key(i: number): string | null {
    return Array.from(this.store.keys())[i] ?? null
  }
  getItem(k: string): string | null {
    return this.store.get(k) ?? null
  }
  setItem(k: string, v: string): void {
    this.store.set(k, String(v))
  }
  removeItem(k: string): void {
    this.store.delete(k)
  }
  clear(): void {
    this.store.clear()
  }
}

function ensureLocalStorage(): void {
  const w = globalThis as unknown as { window?: Window & typeof globalThis }
  const win = w.window
  if (!win) return
  if (!('localStorage' in win) || !win.localStorage) {
    Object.defineProperty(win, 'localStorage', { value: new MemoryStorage(), configurable: true })
  }
}

ensureLocalStorage()
beforeEach(() => {
  ensureLocalStorage()
  try {
    window.localStorage.clear()
  } catch {
    /* ignore */
  }
})
