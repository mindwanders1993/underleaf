// Single-pass LaTeX escape. Replacing chars one-at-a-time with String.replace would
// double-escape the braces emitted by \textbackslash{} / \^{} / \~{}.
const SPECIALS_RE = /([\\&%$#_^{}~])/g
const SPECIALS_MAP: Record<string, string> = {
  '\\': '\\textbackslash{}',
  '&': '\\&',
  '%': '\\%',
  $: '\\$',
  '#': '\\#',
  _: '\\_',
  '^': '\\^{}',
  '{': '\\{',
  '}': '\\}',
  '~': '\\~{}',
}

export function escapeLatex(input: string | undefined | null): string {
  if (input === undefined || input === null) return ''
  return String(input).replace(SPECIALS_RE, (ch) => SPECIALS_MAP[ch])
}
