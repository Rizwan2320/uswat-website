import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/* Stray-colour guard (plan P2: "lint rule against stray colours").
   Every hex colour in the source must be a design token (src/design/tokens.css), plain white or black, or be listed in
   stray-colours.allow.json with its file. The list is a ratchet: it may only shrink. A new off-palette colour fails the
   build (this test runs in CI through `pnpm test:int`). It is a test and not an ESLint rule because ESLint here does
   not parse the CSS modules. rgb() values are not checked: they are used for shadows and tints of token colours. */
const src = join(__dirname, '../../src')
const norm = (h: string) => {
  const x = h.toLowerCase()
  return x.length === 4 ? '#' + [...x.slice(1)].map((c) => c + c).join('') : x
}

const tokenHex = new Set(
  [...readFileSync(join(src, 'design/tokens.css'), 'utf8').matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => norm(m[0])),
)
const free = new Set(['#fff', '#ffffff', '#000', '#000000'])
const allow: Record<string, string[]> = JSON.parse(readFileSync(join(__dirname, 'stray-colours.allow.json'), 'utf8')).allowed

const files: string[] = []
const walk = (dir: string) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p)
    else if (/\.(css|tsx|ts)$/.test(name) && !p.endsWith('tokens.css') && !p.includes('payload-types')) files.push(p)
  }
}
walk(src)

const found: Record<string, string[]> = {}
for (const f of files) {
  const text = readFileSync(f, 'utf8')
  for (const m of text.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
    const hex = norm(m[0])
    if (!/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(hex)) continue // e.g. an id selector or anchor
    if (tokenHex.has(hex) || free.has(hex)) continue
    ;(found[relative(src, f)] ??= []).push(hex)
  }
}

describe('stray colours', () => {
  it('finds no hex colour outside the tokens, white, black and the recorded legacy list', () => {
    const fresh: string[] = []
    for (const [file, list] of Object.entries(found)) {
      for (const hex of new Set(list)) if (!(allow[file] ?? []).includes(hex)) fresh.push(`${file}: ${hex}`)
    }
    expect(fresh, 'Add the colour to src/design/tokens.css, or use a token. Do not add to the allow list.').toEqual([])
  })

  it('keeps the legacy list honest: every entry is still used', () => {
    const stale: string[] = []
    for (const [file, list] of Object.entries(allow)) for (const hex of list) if (!(found[file] ?? []).includes(hex)) stale.push(`${file}: ${hex}`)
    expect(stale, 'Remove these from stray-colours.allow.json; the list only shrinks.').toEqual([])
  })
})
