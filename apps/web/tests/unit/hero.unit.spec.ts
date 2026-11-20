import { describe, expect, it } from 'vitest'

import { heroFigure } from '../../src/site/articles/hero'

const media = (over: Record<string, unknown> = {}) => ({
  url: '/api/media/file/a.png',
  alt: 'A sample picture',
  width: 1200,
  height: 630,
  rightsStatus: 'owned',
  credit: 'Sample placeholder (generated)',
  ...over,
})

describe('heroFigure', () => {
  it('returns the picture with its alt text, size and credit', () => {
    expect(heroFigure({ heroImage: media() })).toEqual({ src: '/api/media/file/a.png', alt: 'A sample picture', width: 1200, height: 630, credit: 'Sample placeholder (generated)' })
  })
  it('returns nothing when there is no hero, or it is only an id (not populated)', () => {
    expect(heroFigure({})).toBeNull()
    expect(heroFigure({ heroImage: null })).toBeNull()
    expect(heroFigure({ heroImage: 42 })).toBeNull()
  })
  it('refuses unknown or missing rights', () => {
    expect(heroFigure({ heroImage: media({ rightsStatus: 'unknown' }) })).toBeNull()
    expect(heroFigure({ heroImage: media({ rightsStatus: undefined }) })).toBeNull()
  })
  it('allows every other rights status', () => {
    for (const r of ['owned', 'permission_granted', 'permission_pending', 'licensed']) expect(heroFigure({ heroImage: media({ rightsStatus: r }) })).not.toBeNull()
  })
  it('refuses an unsafe or non-image address', () => {
    for (const url of ['javascript:alert(1)', '//evil.test/a.png', 'mailto:a@b.test', '#x', 'http://x.test/a.png', undefined, '']) expect(heroFigure({ heroImage: media({ url }) }), String(url)).toBeNull()
    expect(heroFigure({ heroImage: media({ url: 'https://cdn.example.com/a.png' }) })?.src).toBe('https://cdn.example.com/a.png')
  })
  it('turns empty alt into a decorative picture and drops bad sizes', () => {
    const h = heroFigure({ heroImage: media({ alt: '  ', width: 0, height: 'x', credit: '' }) })
    expect(h).toMatchObject({ alt: '', width: null, height: null, credit: null })
  })
})
