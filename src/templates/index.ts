import jakesResume from './jakes-resume'
import deedyCv from './deedy-cv'
import awesomeCv from './awesome-cv'
import renderCvModern from './rendercv-modern'
import type { TemplateRenderer } from './types'

export type { TemplateRenderer, TemplateRenderedFiles } from './types'

export const TEMPLATES: Record<string, TemplateRenderer> = {
  [jakesResume.id]: jakesResume,
  [deedyCv.id]: deedyCv,
  [awesomeCv.id]: awesomeCv,
  [renderCvModern.id]: renderCvModern,
}

export const DEFAULT_TEMPLATE_ID = jakesResume.id

export function getTemplate(id: string | undefined | null): TemplateRenderer | null {
  if (!id) return null
  return TEMPLATES[id] ?? null
}

export function listTemplates(): TemplateRenderer[] {
  return Object.values(TEMPLATES)
}
