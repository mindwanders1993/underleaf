import type { Project } from '../types/project'

export type CloudSyncStatus =
  | 'local-only'
  | 'connecting'
  | 'connected'
  | 'syncing'
  | 'error'

export interface CloudSyncClient {
  readonly status: CloudSyncStatus
  connect(): Promise<void>
  disconnect(): Promise<void>
  push(project: Project): Promise<void>
  pull(): Promise<Project | null>
  subscribe(listener: (status: CloudSyncStatus) => void): () => void
}
