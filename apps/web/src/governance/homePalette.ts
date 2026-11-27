/**
 * The landing page's three editable colours: green, yellow and maroon (owner request 2026-11-27).
 *
 * Pure and shared: the home page uses it to build the style block. Anything that is not exactly `#rrggbb` is ignored, so a bad stored
 * value can never reach the page.
 *
 * Each family has a base colour and tints derived from it (see tokens.css). A family left blank keeps the
 * standard values exactly, because nothing is emitted for it.
 */

export type Rgb = [number, number, number]

export type HomeColours = { green?: string | null; yellow?: string | null; maroon?: string | null }

export const STANDARD = {
  ivory: '#fcfaf4',
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

/** The colours that will actually show: only complete, valid values. Used by the home page. */
export const usableColours = (c: HomeColours | null | undefined): HomeColours => ({
  green: cleanHex(c?.green),
  yellow: cleanHex(c?.yellow),
  maroon: cleanHex(c?.maroon),
})
