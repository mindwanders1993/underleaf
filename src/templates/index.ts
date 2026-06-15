import jakesResume from './jakes-resume'
import type { TemplateRenderer } from './types'

export type { TemplateRenderer, TemplateRenderedFiles } from './types'

export const TEMPLATES: Record<string, TemplateRenderer> = {
  [jakesResume.id]: jakesResume,
}

export const DEFAULT_TEMPLATE_ID = jakesResume.id

export function getTemplate(id: string | undefined | null): TemplateRenderer | null {
  if (!id) return null
  return TEMPLATES[id] ?? null
}

export function listTemplates(): TemplateRenderer[] {
  return Object.values(TEMPLATES)
}
