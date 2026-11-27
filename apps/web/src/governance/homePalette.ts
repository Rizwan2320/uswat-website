/**
 * The landing page's three editable colours: green, yellow and maroon (owner request 2026-11-27).
 *
 * Pure and shared: the admin hook uses it to refuse an unreadable choice at publish, and the home page
 * uses it to build the style block. Anything that is not exactly `#rrggbb` is ignored, so a bad stored
 * value can never reach the page.
 *
 * Each family has a base colour and tints derived from it (see tokens.css). A family left blank keeps the
 * standard values exactly, because nothing is emitted for it.
 */

export type Rgb = [number, number, number]

export type HomeColours = { green?: string | null; yellow?: string | null; maroon?: string | null }

export const STANDARD = {
  ivory: '#fcfaf4',
  ivoryDeep: '#f3efe3',
  green: '#003b17',
  yellow: '#f2b705',
  maroon: '#7a1f26',
} as const

const HEX = /^#[0-9a-fA-F]{6}$/

/** `#RRGGBB` in lower case, or null when the value is not a six-digit hex colour. */
export const cleanHex = (value: unknown): string | null =>
  typeof value === 'string' && HEX.test(value.trim()) ? value.trim().toLowerCase() : null

export const toRgb = (hex: string): Rgb => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const toHex = ([r, g, b]: Rgb): string =>
  '#' +
  [r, g, b]
    .map((v) =>
      Math.max(0, Math.min(255, Math.round(v)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')

const mix = (a: Rgb, b: Rgb, t: number): Rgb =>
  [0, 1, 2].map((i) => a[i]! * (1 - t) + b[i]! * t) as Rgb

const WHITE: Rgb = [255, 255, 255]
const BLACK: Rgb = [0, 0, 0]

/** Darker shade: the base towards black. 0.29 turns the standard green into the standard deep green. */
const darken = (hex: string, t: number): string => toHex(mix(toRgb(hex), BLACK, t))
const lighten = (hex: string, t: number): string => toHex(mix(toRgb(hex), WHITE, t))

const channel = (v: number) => {
  const s = v / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
const luminance = ([r, g, b]: Rgb) =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
export const contrast = (a: string, b: string): number => {
  const la = luminance(toRgb(a))
  const lb = luminance(toRgb(b))
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

export type Palette = Record<string, string>

/** The CSS custom properties to override, for the families that were chosen. Empty when none was. */
export function paletteVars(colours: HomeColours | null | undefined): Palette {
  const out: Palette = {}
  const green = cleanHex(colours?.green)
  const yellow = cleanHex(colours?.yellow)
  const maroon = cleanHex(colours?.maroon)
  if (green) {
    const [r, g, b] = toRgb(green)
    out['--forest'] = green
    out['--forest-deep'] = darken(green, 0.29)
    out['--forest-soft'] = lighten(green, 0.12)
    out['--text'] = `rgb(${r} ${g} ${b} / 0.85)`
  }
  if (yellow) {
    out['--gold'] = yellow
    out['--gold-light'] = lighten(yellow, 0.3)
  }
  if (maroon) {
    out['--maroon'] = maroon
    out['--maroon-deep'] = darken(maroon, 0.24)
  }
  return out
}

/** The style text for the landing page, or null when nothing was chosen. Values are validated hex only. */
export function paletteCss(colours: HomeColours | null | undefined): string | null {
  const vars = paletteVars(colours)
  const lines = Object.entries(vars).map(([k, v]) => `${k}:${v}`)
  return lines.length === 0 ? null : `:root{${lines.join(';')}}`
}

type Pair = { label: string; fg: string; bg: string; min: number }

/** The reading pairs the three families take part in (the same ones tests/unit/tokens.contrast checks). */
function pairs(colours: HomeColours | null | undefined): Pair[] {
  const v = { ...defaults(), ...paletteVars(colours) }
  const forest = v['--forest']!
  const deep = v['--forest-deep']!
  const soft = v['--forest-soft']!
  const gold = v['--gold']!
  const goldLight = v['--gold-light']!
  const maroon = v['--maroon']!
  const maroonDeep = v['--maroon-deep']!
  const { ivory, ivoryDeep } = { ivory: STANDARD.ivory, ivoryDeep: STANDARD.ivoryDeep }
  return [
    { label: 'green text on the ivory background', fg: forest, bg: ivory, min: 4.5 },
    { label: 'green text on the tinted background', fg: forest, bg: ivoryDeep, min: 4.5 },
    { label: 'green hover text on ivory', fg: soft, bg: ivory, min: 4.5 },
    { label: 'ivory text on the green', fg: ivory, bg: forest, min: 4.5 },
    { label: 'ivory text on the deep green (top bar, footer)', fg: ivory, bg: deep, min: 4.5 },
    { label: 'ivory text on the hover green', fg: ivory, bg: soft, min: 4.5 },
    { label: 'green label on the yellow buttons', fg: forest, bg: gold, min: 4.5 },
    { label: 'green label on the yellow hover', fg: forest, bg: goldLight, min: 4.5 },
    { label: 'yellow text on the green', fg: gold, bg: forest, min: 4.5 },
    { label: 'yellow headings on the deep green footer', fg: gold, bg: deep, min: 4.5 },
    { label: 'maroon text on the ivory background', fg: maroon, bg: ivory, min: 4.5 },
    { label: 'maroon text on the tinted background', fg: maroon, bg: ivoryDeep, min: 4.5 },
    { label: 'ivory text on the maroon buttons', fg: ivory, bg: maroon, min: 4.5 },
    { label: 'ivory text on the maroon hover', fg: ivory, bg: maroonDeep, min: 4.5 },
  ]
}

const defaults = (): Palette => ({
  '--forest': STANDARD.green,
  '--forest-deep': '#002a10',
  '--forest-soft': '#0b5a27',
  '--gold': STANDARD.yellow,
  '--gold-light': '#ffd84d',
  '--maroon': STANDARD.maroon,
  '--maroon-deep': '#5e171c',
})

export type PaletteProblem = { label: string; ratio: number; min: number }

/**
 * Which reading pairs fail with the chosen colours. Only pairs that involve a changed family are judged,
 * so the standard look is never blocked. An empty list means the choice is fit to publish.
 */
export function paletteProblems(colours: HomeColours | null | undefined): PaletteProblem[] {
  const chosen = {
    green: cleanHex(colours?.green) !== null,
    yellow: cleanHex(colours?.yellow) !== null,
    maroon: cleanHex(colours?.maroon) !== null,
  }
  if (!chosen.green && !chosen.yellow && !chosen.maroon) return []
  const touches = (label: string): boolean =>
    (chosen.green && /green|forest/.test(label)) ||
    (chosen.yellow && /yellow/.test(label)) ||
    (chosen.maroon && /maroon/.test(label))
  return pairs(colours)
    .filter((p) => touches(p.label))
    .map((p) => ({ label: p.label, ratio: contrast(p.fg, p.bg), min: p.min }))
    .filter((p) => p.ratio < p.min)
}

/** A plain sentence for the editor, or null when the colours are fine. */
export function paletteMessage(colours: HomeColours | null | undefined): string | null {
  const bad = paletteProblems(colours)
  if (bad.length === 0) return null
  const list = bad.map((p) => `${p.label} (${p.ratio.toFixed(1)}:1, needs ${p.min}:1)`).join('; ')
  return `These colours would be hard to read: ${list}. Choose a darker green or maroon, or a lighter yellow.`
}

/** The colours that will actually show: only complete, valid values. Used by the home page. */
export const usableColours = (c: HomeColours | null | undefined): HomeColours => ({
  green: cleanHex(c?.green),
  yellow: cleanHex(c?.yellow),
  maroon: cleanHex(c?.maroon),
})
