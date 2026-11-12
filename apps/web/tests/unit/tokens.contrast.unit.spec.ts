import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(join(__dirname, '../../src/design/tokens.css'), 'utf8')
const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '')

/* tokens.css has three blocks: the light :root, the dark block for a manual choice, and the same dark block inside
   @media (prefers-color-scheme: dark) for the system setting. */
const block = (opener: RegExp): string => {
  const m = opener.exec(css)
  if (!m) throw new Error(`block not found: ${opener}`)
  const start = m.index + m[0].length
  const end = css.indexOf('}', start)
  return stripComments(css.slice(start, end))
}
const declarations = (body: string): Record<string, string> => {
  const out: Record<string, string> = {}
  for (const m of body.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) out[m[1]!] = m[2]!.trim()
  return out
}
const lightBlock = block(/^:root \{/m)
const darkManual = block(/^:root\[data-theme='dark'\] \{/m)
const darkSystem = block(/:root:not\(\[data-theme='light'\]\) \{/m)
const light = declarations(lightBlock)
const dark = { ...light, ...declarations(darkManual) } // dark overrides sit on top of the light values

type Rgb = [number, number, number]
type Colour = { rgb: Rgb; alpha: number }
const hexToRgb = (hex: string): Rgb => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
// A token value is a hex, rgb(r g b / a) or var(--other); resolve it against one theme's map.
const parse = (theme: Record<string, string>, name: string, depth = 0): Colour => {
  const v = theme[name]
  if (v === undefined) throw new Error(`token --${name} not found in tokens.css`)
  if (depth > 5) throw new Error(`token --${name} loops`)
  let m = /^var\(--([a-z0-9-]+)\)$/.exec(v)
  if (m) return parse(theme, m[1]!, depth + 1)
  m = /^#([0-9a-fA-F]{6})$/.exec(v)
  if (m) return { rgb: hexToRgb(v), alpha: 1 }
  m = /^rgb\((\d+) (\d+) (\d+)(?: \/ ([0-9.]+))?\)$/.exec(v)
  if (m) return { rgb: [Number(m[1]), Number(m[2]), Number(m[3])], alpha: m[4] === undefined ? 1 : Number(m[4]) }
  throw new Error(`token --${name}: cannot read "${v}"`)
}
// Composite `fg` over `bg` (what the browser paints for rgb(... / alpha)).
const over = (fg: Colour, bg: Colour): Rgb =>
  [0, 1, 2].map((i) => Math.round(fg.rgb[i]! * fg.alpha + bg.rgb[i]! * (1 - fg.alpha))) as Rgb
const channel = (v: number) => {
  const s = v / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
const luminance = ([r, g, b]: Rgb) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
const ratio = (fg: Rgb, bg: Rgb) => {
  const a = luminance(fg)
  const b = luminance(bg)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

// [label, foreground token, background token, minimum ratio]
// 4.5 = WCAG 2.2 AA normal text; 3 = large text and non-text UI (focus rings, icons, control boundaries).
type Pair = [string, string, string, number]

// Brand bands (top bar, hero, page header, footer) use the brand colours directly in BOTH themes.
const bandPairs: Pair[] = [
  ['ivory on forest (active nav, badges)', 'ivory', 'forest', 4.5],
  ['ivory on forest-deep (top bar, footer)', 'ivory', 'forest-deep', 4.5],
  ['ivory on forest-soft (hover fills)', 'ivory', 'forest-soft', 4.5],
  ['forest on gold (gold button label)', 'forest', 'gold', 4.5],
  ['forest on gold-light (gold button hover)', 'forest', 'gold-light', 4.5],
  ['gold on forest (hero accent word, quote mark)', 'gold', 'forest', 4.5],
  ['gold on forest-deep (footer headings)', 'gold', 'forest-deep', 4.5],
  ['gold focus ring on forest', 'gold', 'forest', 3],
]
// The same roles in each theme. In light they resolve to the brand colours, so these also guard light mode.
const rolePairs: Pair[] = [
  ['body text on the page', 'text', 'surface', 4.5],
  ['body text on a tinted section', 'text', 'surface-alt', 4.5],
  ['body text on a card or panel', 'text', 'surface-raised', 4.5],
  ['body text on a menu or dialog', 'text', 'surface-card', 4.5],
  ['headings and links on the page', 'ink', 'surface', 4.5],
  ['headings and links on a tinted section', 'ink', 'surface-alt', 4.5],
  ['headings and links on a card', 'ink', 'surface-raised', 4.5],
  ['headings and links on a menu or dialog', 'ink', 'surface-card', 4.5],
  ['hover title on a card', 'ink-hover', 'surface-raised', 4.5],
  ['hover title on the page', 'ink-hover', 'surface', 4.5],
  ['dates and small accents on the page', 'mark', 'surface', 4.5],
  ['dates and small accents on a tinted section', 'mark', 'surface-alt', 4.5],
  ['dates and small accents on a card', 'mark', 'surface-raised', 4.5],
  ['accent hover on the page', 'mark-hover', 'surface', 4.5],
  ['button label on a call-to-action button', 'on-cta', 'cta', 4.5],
  ['button label on a call-to-action button, hover', 'on-cta', 'cta-hover', 4.5],
  ['label on a selected tab or current page', 'on-sel', 'sel', 4.5],
  ['label on a selected tab or current page, hover', 'on-sel', 'sel-hover', 4.5],
  ['glyph on an icon circle or badge', 'on-fill', 'fill', 4.5],
  ['call-to-action button against the page', 'cta', 'surface', 3],
  ['selected tab against a card', 'sel', 'surface-raised', 3],
  ['outline and focus ring (ink) on the page', 'ink', 'surface', 3],
  ['outline and focus ring (ink) on a card', 'ink', 'surface-raised', 3],
]
// Control boundaries (search box). Light mode uses the pale green border from the original design at about 1.6:1, which is
// below the 3:1 that WCAG 2.2 asks for; that is an existing gap in light mode, listed in docs/STATUS.md, not fixed here.
const darkOnlyPairs: Pair[] = [['input border on a card', 'line-input', 'surface-raised', 3]]

const check = (theme: Record<string, string>, [, fgName, bgName, min]: Pair) => {
  const bg = parse(theme, bgName)
  expect(bg.alpha).toBe(1) // a background must be opaque for the ratio to mean anything
  const bgRgb = bg.rgb
  const fg = over(parse(theme, fgName), { rgb: bgRgb, alpha: 1 })
  expect(ratio(fg, bgRgb)).toBeGreaterThanOrEqual(min)
}

describe('design tokens: structure', () => {
  it('parses the nine brand colours', () => {
    const hex = Object.keys(light).filter((k) => /^#[0-9a-fA-F]{6}$/.test(light[k]!))
    expect(hex.filter((k) => !['surface-raised', 'line-green', 'line-input', 'tint', 'tint-strong'].includes(k)).sort()).toEqual(
      ['forest', 'forest-deep', 'forest-soft', 'gold', 'gold-light', 'ivory', 'ivory-deep', 'maroon', 'maroon-deep'].sort(),
    )
  })
  it('finds the body text alpha in both themes', () => {
    expect(parse(light, 'text').alpha).toBeGreaterThan(0.5)
    expect(parse(dark, 'text').alpha).toBeGreaterThan(0.5)
  })
  it('keeps the two dark blocks identical (manual choice and system setting)', () => {
    const norm = (s: string) => s.replace(/\s+/g, ' ').trim()
    expect(norm(darkSystem)).toBe(norm(darkManual))
  })
  it('defines every dark override for a role that exists in light', () => {
    const overrides = Object.keys(declarations(darkManual))
    expect(overrides.filter((k) => !(k in light))).toEqual([])
  })
  it('gives every role token a dark value', () => {
    const roles = ['surface', 'surface-alt', 'surface-raised', 'surface-card', 'ink', 'ink-hover', 'text', 'mark', 'mark-hover', 'mark-rgb', 'on-mark', 'cta', 'cta-hover', 'on-cta', 'sel', 'sel-hover', 'on-sel', 'fill', 'on-fill', 'hairline', 'line-rgb', 'line-green', 'line-input', 'tint', 'tint-strong', 'shadow-rgb']
    const darkOwn = declarations(darkManual)
    expect(roles.filter((k) => !(k in light))).toEqual([])
    expect(roles.filter((k) => !(k in darkOwn))).toEqual([])
  })
})

describe('design tokens: WCAG 2.2 contrast, brand bands (both themes)', () => {
  for (const p of bandPairs) it(`${p[0]} >= ${p[3]}:1`, () => check(light, p))
})

describe('design tokens: WCAG 2.2 contrast, light theme', () => {
  const extra: Pair[] = [
    ['forest-soft hover title on ivory', 'forest-soft', 'ivory', 4.5],
    ['forest headings on ivory-deep', 'forest', 'ivory-deep', 4.5],
    ['maroon on ivory-deep (dates on tinted cards)', 'maroon', 'ivory-deep', 4.5],
    ['ivory on maroon (Apply button label)', 'ivory', 'maroon', 4.5],
    ['ivory on maroon-deep (Apply button hover)', 'ivory', 'maroon-deep', 4.5],
  ]
  for (const p of [...rolePairs, ...extra]) it(`${p[0]} >= ${p[3]}:1`, () => check(light, p))
  it('dim ivory on forest-deep (footer secondary text, 78%) >= 4.5:1', () => {
    const fg = over({ rgb: parse(light, 'ivory').rgb, alpha: 0.78 }, parse(light, 'forest-deep'))
    expect(ratio(fg, parse(light, 'forest-deep').rgb)).toBeGreaterThanOrEqual(4.5)
  })
})

describe('design tokens: WCAG 2.2 contrast, dark theme', () => {
  for (const p of [...rolePairs, ...darkOnlyPairs]) it(`${p[0]} >= ${p[3]}:1`, () => check(dark, p))
  it('keeps maroon off dark surfaces (maroon is for light surfaces only)', () => {
    for (const name of ['mark', 'mark-hover', 'cta', 'cta-hover']) expect(dark[name]).not.toMatch(/maroon/)
    expect(declarations(darkManual)['mark']).not.toBe(light['mark'])
  })
})
