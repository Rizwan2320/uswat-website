import { describe, expect, it } from 'vitest'

import { heroSlides } from '../../src/site/content/hero'
import { stats } from '../../src/site/content/stats'
import { toHeroSlides, toStats, type HomeDoc } from '../../src/site/home/homeMap'

const media = (over: Record<string, unknown> = {}) => ({ url: '/api/media/file/a.jpg', alt: 'A lecture hall', width: 1600, height: 900, ...over })
const slide = (over: Record<string, unknown> = {}) => ({
  image: media(),
  primary: { label: 'Explore Programs', href: '/academics', icon: 'cap' as const },
  secondary: { label: 'Admissions', href: 'https://example.test/a', icon: 'document' as const },
  ...over,
})
const stat = (over: Record<string, unknown> = {}) => ({ value: 80, suffix: '+', label: 'Programs', icon: 'cap' as const, sample: false, source: 'Registrar', verifiedAt: '2026-11-08T00:00:00.000Z', ...over })

describe('toHeroSlides', () => {
  it('uses the files when the global is missing or empty', () => {
    expect(toHeroSlides(null, heroSlides)).toBe(heroSlides)
    expect(toHeroSlides({ slides: [] }, heroSlides)).toBe(heroSlides)
  })

  it('maps three complete slides, with the focal point as a CSS position', () => {
    const doc: HomeDoc = { slides: [slide({ image: media({ focalX: 40.4, focalY: 70 }) }), slide(), slide()] }
    const out = toHeroSlides(doc, heroSlides)
    expect(out).toHaveLength(3)
    expect(out[0]).toEqual({
      image: { src: '/api/media/file/a.jpg', alt: 'A lecture hall', width: 1600, height: 900, focus: '40% 70%' },
      primary: { label: 'Explore Programs', href: '/academics', icon: 'cap' },
      secondary: { label: 'Admissions', href: 'https://example.test/a', icon: 'document' },
    })
    expect(out[1]!.image).not.toHaveProperty('focus')
  })

  it('skips a slide whose picture cannot be shown or whose button is incomplete, and falls back below three', () => {
    const bad = [slide({ image: 7 }), slide({ image: media({ alt: '' }) }), slide({ image: media({ url: null }) }), slide({ secondary: { label: 'x', href: '' } })]
    expect(toHeroSlides({ slides: [...bad, slide(), slide()] }, heroSlides)).toBe(heroSlides)
    expect(toHeroSlides({ slides: [...bad, slide(), slide(), slide()] }, heroSlides)).toHaveLength(3)
  })
})

describe('toStats', () => {
  it('uses the files when the global is missing or short', () => {
    expect(toStats(null, stats)).toBe(stats)
    expect(toStats({ stats: [stat(), stat()] }, stats)).toBe(stats)
  })

  it('maps figures with their source, date and sample flag', () => {
    const out = toStats({ stats: [stat(), stat({ value: 0, suffix: '', sample: true, source: null, verifiedAt: null }), stat({ label: 'Faculty', icon: 'person' })] }, stats)
    expect(out).toHaveLength(3)
    expect(out[0]).toEqual({ id: 'home-stat-1', value: 80, suffix: '+', label: 'Programs', icon: 'cap', source: 'Registrar', verifiedAt: '2026-11-08' })
    expect(out[1]).toEqual({ id: 'home-stat-2', value: 0, label: 'Programs', icon: 'cap', sample: true })
  })

  it('drops a figure with no label or icon', () => {
    const out = toStats({ stats: [stat({ label: '' }), stat({ icon: null }), stat(), stat(), stat()] }, stats)
    expect(out).toHaveLength(3)
  })
})
