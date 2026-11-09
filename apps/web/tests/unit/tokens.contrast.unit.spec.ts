import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(join(__dirname, '../../src/design/tokens.css'), 'utf8')

const tokens: Record<string, string> = {}
for (const m of css.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6});/g)) {
  tokens[m[1]!] = m[2]!
}

type Rgb = [number, number, number]
const toRgb = (hex: string): Rgb => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
// Composite `fg` at `alpha` over `bg` (what the browser paints for rgb(... / alpha)).
const blend = (fg: string, bg: string, alpha: number): Rgb => {
  const f = toRgb(fg)
  const b = toRgb(bg)
  return [0, 1, 2].map((i) => Math.round(f[i]! * alpha + b[i]! * (1 - alpha))) as Rgb
}
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
const c = (name: string): Rgb => {
  const hex = tokens[name]
  if (!hex) throw new Error(`token --${name} not found in tokens.css`)
  return toRgb(hex)
}

// The body text token is rgb(0 59 23 / 0.85); assert the CSS still says so, then blend the same way.
const bodyAlpha = css.match(/--text:\s*rgb\(0 59 23 \/ ([0-9.]+)\)/)
const textOnIvory = blend(tokens.forest!, tokens.ivory!, Number(bodyAlpha?.[1] ?? NaN))
const textOnIvoryDeep = blend(tokens.forest!, tokens['ivory-deep']!, Number(bodyAlpha?.[1] ?? NaN))
// Secondary footer text: ivory at 78% over the footer base.
const dimOnDeep = blend(tokens.ivory!, tokens['forest-deep']!, 0.78)

// [label, foreground, background, minimum ratio]
// 4.5 = WCAG 2.2 AA normal text; 3 = large text and non-text UI (focus rings, icons).
const pairs: Array<[string, Rgb, Rgb, number]> = [
  ['body text on ivory', textOnIvory, c('ivory'), 4.5],
  ['body text on ivory-deep', textOnIvoryDeep, c('ivory-deep'), 4.5],
  ['forest headings on ivory', c('forest'), c('ivory'), 4.5],
  ['forest headings on ivory-deep', c('forest'), c('ivory-deep'), 4.5],
  ['forest-soft hover title on ivory', c('forest-soft'), c('ivory'), 4.5],
  ['ivory on forest (active nav, badges)', c('ivory'), c('forest'), 4.5],
  ['ivory on forest-deep (top bar, footer)', c('ivory'), c('forest-deep'), 4.5],
  ['ivory on forest-soft (hover fills)', c('ivory'), c('forest-soft'), 4.5],
  ['dim ivory on forest-deep (footer secondary text)', dimOnDeep, c('forest-deep'), 4.5],
  ['forest on gold (gold button label)', c('forest'), c('gold'), 4.5],
  ['forest on gold-light (gold button hover)', c('forest'), c('gold-light'), 4.5],
  ['gold on forest (hero accent word, quote mark)', c('gold'), c('forest'), 4.5],
  ['gold on forest-deep (footer headings)', c('gold'), c('forest-deep'), 4.5],
  ['maroon on ivory (dates, quote mark, small accents)', c('maroon'), c('ivory'), 4.5],
  ['maroon on ivory-deep (dates on tinted cards)', c('maroon'), c('ivory-deep'), 4.5],
  ['ivory on maroon (Apply button label)', c('ivory'), c('maroon'), 4.5],
  ['ivory on maroon-deep (Apply button hover)', c('ivory'), c('maroon-deep'), 4.5],
  ['gold focus ring on forest', c('gold'), c('forest'), 3],
  ['forest focus ring on ivory', c('forest'), c('ivory'), 3],
]

describe('design tokens: WCAG 2.2 contrast', () => {
  it('parses every hex token', () => {
    expect(Object.keys(tokens).sort()).toEqual(
      ['forest', 'forest-deep', 'forest-soft', 'gold', 'gold-light', 'ivory', 'ivory-deep', 'maroon', 'maroon-deep'].sort(),
    )
  })
  it('finds the body text alpha', () => {
    expect(Number(bodyAlpha?.[1])).toBeGreaterThan(0.5)
  })
  for (const [label, fg, bg, min] of pairs) {
    it(`${label} >= ${min}:1`, () => {
      expect(ratio(fg, bg)).toBeGreaterThanOrEqual(min)
    })
  }
})
