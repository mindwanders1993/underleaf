import type { ResumeData } from './resume'

export interface ProjectFile {
  name: string // Relative file path, e.g., 'main.tex', 'refs.bib'
  content: string // File text content (or base64 encoded for binary assets like images)
  type: 'tex' | 'bib' | 'image' | 'other'
}

export type ProjectMode = 'raw' | 'structured'

export interface Project {
  id: string
  name: string
  files: ProjectFile[]
  mainFile: string
  mode: ProjectMode
  resume?: ResumeData
  templateId?: string
}

export type CompileStatus = 'IDLE' | 'COMPILING' | 'SUCCESS' | 'ERROR'

export interface CompileError {
  line: number
  column?: number
  message: string
  file: string
  severity: 'error' | 'warning' | 'info'
}

export interface CompilationState {
  status: CompileStatus
  pdfBlobUrl: string | null // Keep a URL reference that can be easily loaded in iframe/pdf viewer
  logs: string[]
  errors: CompileError[]
}

export interface EditorSettings {
  theme: 'dark' | 'light'
  fontSize: number
  autoCompile: boolean
}

export interface UIState {
  activePanel: 'editor' | 'preview' | 'files' // For responsive tab-switching on mobile
  sidebarOpen: boolean
  logOpen: boolean
}

export interface AuthUser {
  id: string
  username: string
  avatarUrl?: string
}

export interface AuthState {
  user: AuthUser | null
  isLoggedIn: boolean
}
