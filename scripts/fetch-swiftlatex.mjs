#!/usr/bin/env node
// Vendor the SwiftLaTeX PdfTeX engine into public/swiftlatex/.
// Defaults to the actively maintained TeXlyre fork (2025–2026).
// Override the source by setting SWIFTLATEX_BASE_URL.

import { mkdir, writeFile, stat } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const TARGET_DIR = resolve(ROOT, 'public/swiftlatex')
// www.swiftlatex.com hosts the prebuilt engine. swiftlatexpdftex.js is both the
// loader and the worker script — the engine spawns a Worker pointing at the same
// URL. So we vendor 3 files, not 4.
const BASE_URL = process.env.SWIFTLATEX_BASE_URL ?? 'https://www.swiftlatex.com'

const FILES = [
  'PdfTeXEngine.js',
  'swiftlatexpdftex.js',
  'swiftlatexpdftex.wasm',
]

async function alreadyVendored() {
  try {
    const head = await stat(resolve(TARGET_DIR, FILES[0]))
    return head.size > 0
  } catch {
    return false
  }
}

async function fetchOne(name) {
  const url = `${BASE_URL}/${name}`
  process.stdout.write(`  ${name} … `)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(resolve(TARGET_DIR, name), buf)
  process.stdout.write(`${(buf.length / 1024).toFixed(1)} KB\n`)
}

async function main() {
  await mkdir(TARGET_DIR, { recursive: true })

  if (process.argv.includes('--force') === false && (await alreadyVendored())) {
    console.log('[fetch-swiftlatex] engine already present in public/swiftlatex/. Use --force to refresh.')
    return
  }

  console.log(`[fetch-swiftlatex] downloading from ${BASE_URL}`)
  for (const f of FILES) {
    try {
      await fetchOne(f)
    } catch (err) {
      console.error(`\n[fetch-swiftlatex] FAILED on ${f}: ${err.message}`)
      console.error(
        'If the URL changed, set SWIFTLATEX_BASE_URL to another mirror (e.g. SwiftLaTeX/SwiftLaTeX original).',
      )
      process.exitCode = 1
      return
    }
  }
  console.log('[fetch-swiftlatex] done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
