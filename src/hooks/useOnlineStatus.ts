import { useEffect, useSyncExternalStore } from 'react'

function subscribe(callback: () => void): () => void {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getSnapshot(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

function getServerSnapshot(): boolean {
  return true
}

export function useOnlineStatus(): boolean {
  // useSyncExternalStore avoids the setState-in-effect lint trap and tracks
  // navigator.onLine atomically across concurrent renders.
  const online = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  // Keep React happy about the import even when used in environments without effects.
  useEffect(() => {}, [])
  return online
}
