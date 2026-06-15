import type { CloudSyncClient, CloudSyncStatus } from './types'

export function createLocalOnlyClient(): CloudSyncClient {
  const status: CloudSyncStatus = 'local-only'
  return {
    status,
    async connect() {
      throw new Error('Cloud sync is not yet available — local-only build.')
    },
    async disconnect() {},
    async push() {
      throw new Error('Cloud sync is not yet available.')
    },
    async pull() {
      return null
    },
    subscribe() {
      return () => {}
    },
  }
}
