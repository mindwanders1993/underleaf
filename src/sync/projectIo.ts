import type { Project, ProjectFile } from '../types/project'

function isProjectFile(v: unknown): v is ProjectFile {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    typeof o.name === 'string' &&
    typeof o.content === 'string' &&
    typeof o.type === 'string' &&
    ['tex', 'bib', 'image', 'other'].includes(o.type)
  )
}

export function validateProjectPayload(payload: unknown): Project {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('Project file must be a JSON object.')
  }
  const o = payload as Record<string, unknown>
  if (typeof o.id !== 'string' || !o.id) throw new Error('Project missing id.')
  if (typeof o.name !== 'string') throw new Error('Project missing name.')
  if (typeof o.mainFile !== 'string') throw new Error('Project missing mainFile.')
  if (!Array.isArray(o.files) || !o.files.every(isProjectFile)) {
    throw new Error('Project files[] is missing or malformed.')
  }
  const mode = o.mode === 'structured' ? 'structured' : 'raw'
  return { ...(o as unknown as Project), mode }
}

function todayStamp(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function exportProjectToFile(project: Project, filename?: string): string {
  const name = filename ?? `${project.id}-${todayStamp()}.json`
  const json = JSON.stringify(project, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Defer revoke a tick so Chrome finishes the download wire-up.
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
  return name
}

export async function importProjectFromFile(file: File): Promise<Project> {
  const text = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch (err) {
    throw new Error(`Invalid JSON in ${file.name}: ${(err as Error).message}`, { cause: err })
  }
  return validateProjectPayload(parsed)
}
