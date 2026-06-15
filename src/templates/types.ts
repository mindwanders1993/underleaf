import type { ProjectFile } from '../types/project'
import type { ResumeData } from '../types/resume'

export interface TemplateRenderedFiles {
  mainTex: string
  files: ProjectFile[]
}

export interface TemplateRenderer {
  id: string
  name: string
  description: string
  render(data: ResumeData): TemplateRenderedFiles
}
