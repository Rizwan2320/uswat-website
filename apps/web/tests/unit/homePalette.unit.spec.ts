import { describe, expect, it } from 'vitest'

import { cleanHex, paletteCss, paletteVars, STANDARD } from '../../src/governance/homePalette'

describe('home page colours: what is accepted', () => {
  it('accepts #rrggbb in either case and trims it', () => {
    expect(cleanHex('#003B17')).toBe('#003b17')
    expect(cleanHex('  #f2b705 ')).toBe('#f2b705')
  })
  it.each([
    '',
    'red',
    '#fff',
    '#12345',
    '#1234567',
    '003b17',
    'javascript:alert(1)',
    '#00;}body{display:none',
    null,
    undefined,
    7,
  ])('rejects %s', (v) => {
    expect(cleanHex(v)).toBeNull()
  })
  it('emits nothing for a family left empty, so the standard look is untouched', () => {
    expect(paletteCss({})).toBeNull()
    expect(paletteCss({ green: '', yellow: null, maroon: 'nonsense' })).toBeNull()
  })
  it('never lets anything but validated colours into the style text', () => {
    const css = paletteCss({ green: '#00;}body{display:none', yellow: '#aabbcc' })!
    expect(css).toBe(
      ':root{--gold:#aabbcc;--gold-light:' +
        paletteVars({ yellow: '#aabbcc' })['--gold-light'] +
        '}',
    )
    expect(css).not.toMatch(/display|body|;}/)
  })
})

describe('home page colours: what is derived', () => {
  it('the deep green derived from the standard green is the standard deep green', () => {
    expect(paletteVars({ green: STANDARD.green })['--forest-deep']).toBe('#002a10')
  })
  it('the deep maroon derived from the standard maroon is close to the standard deep maroon', () => {
    const v = paletteVars({ maroon: STANDARD.maroon })['--maroon-deep']!
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16))
    expect(Math.abs(r! - 0x5e)).toBeLessThanOrEqual(2)
    expect(Math.abs(g! - 0x17)).toBeLessThanOrEqual(2)
    expect(Math.abs(b! - 0x1c)).toBeLessThanOrEqual(2)
  })
  it('the page text follows the chosen green at the same 85% strength', () => {
    expect(paletteVars({ green: '#10253f' })['--text']).toBe('rgb(16 37 63 / 0.85)')
  })
})

describe('home page colours: the editor has the final say', () => {
  it('any valid colour is used, however pale or dark (owner decision: no readability check)', () => {
    const css = paletteCss({ green: '#9bd1a8', yellow: '#5a4a00', maroon: '#e0a0a8' })!
    expect(css).toContain('--forest:#9bd1a8')
    expect(css).toContain('--gold:#5a4a00')
    expect(css).toContain('--maroon:#e0a0a8')
  })
})
