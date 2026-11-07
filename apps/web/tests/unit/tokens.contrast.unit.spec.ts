import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(join(__dirname, '../../src/design/tokens.css'), 'utf8')

const tokens: Record<string, string> = {}
for (const m of css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6});/g)) {
  tokens[m[1]!] = m[2]!
}

const channel = (v: number) => {
  const s = v / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
const luminance = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
}
export const ratio = (fg: string, bg: string) => {
  const a = luminance(tokens[fg]!)
  const b = luminance(tokens[bg]!)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

// [foreground, background, minimum ratio, where it is used]
// 4.5 = WCAG 2.2 AA normal text; 3 = large text and non-text UI (focus rings, icons).
const pairs: Array<[string, string, number, string]> = [
  ['ink-900', 'cream-50', 4.5, 'body text on page'],
  ['ink-900', 'paper', 4.5, 'body text on cards'],
  ['ink-600', 'cream-50', 4.5, 'secondary text on page'],
  ['ink-600', 'paper', 4.5, 'secondary text on cards'],
  ['green-800', 'cream-50', 4.5, 'headings and links on page'],
  ['green-800', 'paper', 4.5, 'headings and links on cards'],
  ['green-800', 'sage-100', 4.5, 'text on quiet panels'],
  ['amber-800', 'cream-50', 4.5, 'accent text on page (replaces failing mockup amber)'],
  ['amber-800', 'paper', 4.5, 'accent text on cards'],
  ['paper', 'green-900', 4.5, 'footer text'],
  ['paper', 'green-800', 4.5, 'hero and banner text'],
  ['paper', 'green-700', 4.5, 'primary button and active nav'],
  ['green-800', 'gold-500', 4.5, 'gold button label'],
  ['green-800', 'gold-400', 4.5, 'gold button label on hover'],
  ['gold-500', 'green-800', 4.5, 'hero accent word and headings on green'],
  ['gold-500', 'green-900', 4.5, 'footer headings'],
  ['gold-400', 'green-900', 3, 'focus ring on dark'],
  ['green-700', 'cream-50', 3, 'focus ring on light'],
]

describe('design tokens: WCAG 2.2 contrast', () => {
  it('parses every colour token', () => {
    expect(Object.keys(tokens).length).toBeGreaterThanOrEqual(11)
  })
  for (const [fg, bg, min, use] of pairs) {
    it(`${fg} on ${bg} >= ${min}:1 (${use})`, () => {
      expect(ratio(fg, bg)).toBeGreaterThanOrEqual(min)
    })
  }
})
