import { describe, expect, it } from 'vitest'

import {
  cleanHex,
  paletteCss,
  paletteMessage,
  paletteProblems,
  paletteVars,
  STANDARD,
} from '../../src/governance/homePalette'

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

describe('home page colours: readability', () => {
  it('the standard colours, chosen explicitly, pass', () => {
    expect(
      paletteProblems({ green: STANDARD.green, yellow: STANDARD.yellow, maroon: STANDARD.maroon }),
    ).toEqual([])
  })
  it('nothing chosen is never a problem', () => {
    expect(paletteProblems({})).toEqual([])
    expect(paletteMessage({})).toBeNull()
  })
  it('a pale green is refused: ivory text on it cannot be read', () => {
    const bad = paletteProblems({ green: '#9bd1a8' })
    expect(bad.map((p) => p.label)).toContain('ivory text on the green')
    expect(paletteMessage({ green: '#9bd1a8' })).toMatch(/hard to read/)
  })
  it('a dark yellow is refused: the green label on the buttons cannot be read', () => {
    expect(paletteProblems({ yellow: '#5a4a00' }).map((p) => p.label)).toContain(
      'green label on the yellow buttons',
    )
  })
  it('a pale maroon is refused', () => {
    expect(paletteProblems({ maroon: '#e0a0a8' }).map((p) => p.label)).toContain(
      'maroon text on the ivory background',
    )
  })
  it('a dark navy chosen for green passes', () => {
    expect(paletteProblems({ green: '#10253f' })).toEqual([])
  })
  it('judges only the pairs that involve a changed family', () => {
    // Yellow changed: the green pairs (all standard) are not judged, so none of them can appear.
    for (const p of paletteProblems({ yellow: '#5a4a00' })) expect(p.label).toMatch(/yellow/)
  })

  it('the message has no semicolons (the admin toast splits at them) and says what to change', () => {
    const msg = paletteMessage({ green: '#6b6b6b', yellow: '#b3a26f' })!
    expect(msg).not.toContain(';')
    expect(msg).toMatch(/make the green darker/)
    expect(msg).toMatch(/make the yellow lighter/)
    expect(paletteMessage({ maroon: '#e0a0a8' })).toMatch(/make the maroon darker/)
  })
})
