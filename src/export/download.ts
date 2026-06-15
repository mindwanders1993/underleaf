export function triggerDownload(filename: string, payload: Blob | string, mime = 'text/plain'): void {
  const blob = typeof payload === 'string' ? new Blob([payload], { type: mime }) : payload
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
