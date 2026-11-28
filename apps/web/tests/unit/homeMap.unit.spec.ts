import { describe, expect, it } from 'vitest'

import { hero, heroSlides } from '../../src/site/content/hero'
import { stats } from '../../src/site/content/stats'
import { admissions } from '../../src/site/content/admissions'
import { portals } from '../../src/site/content/portals'
import { leadership } from '../../src/site/content/leadership'
import {
  toAdmissions,
  toHeroContent,
  toHeroSlides,
  toLeadership,
  toPortals,
  toStats,
  type HomeDoc,
} from '../../src/site/home/homeMap'

const media = (over: Record<string, unknown> = {}) => ({
  url: '/api/media/file/a.jpg',
  alt: 'A lecture hall',
  width: 1600,
  height: 900,
  ...over,
})
const slide = (over: Record<string, unknown> = {}) => ({
  image: media(),
  primary: { label: 'Explore Programs', href: '/academics', icon: 'cap' as const },
  secondary: { label: 'Admissions', href: 'https://example.test/a', icon: 'document' as const },
  ...over,
})
const stat = (over: Record<string, unknown> = {}) => ({
  value: 80,
  suffix: '+',
  label: 'Programs',
  icon: 'cap' as const,
  sample: false,
  source: 'Registrar',
  verifiedAt: '2026-11-08T00:00:00.000Z',
  ...over,
})

describe('toHeroSlides', () => {
  it('uses the files when the global is missing or empty', () => {
    expect(toHeroSlides(null, heroSlides)).toBe(heroSlides)
    expect(toHeroSlides({ slides: [] }, heroSlides)).toBe(heroSlides)
  })

  it('maps three complete slides, with the focal point as a CSS position', () => {
    const doc: HomeDoc = {
      slides: [slide({ image: media({ focalX: 40.4, focalY: 70 }) }), slide(), slide()],
    }
    const out = toHeroSlides(doc, heroSlides)
    expect(out).toHaveLength(3)
    expect(out[0]).toEqual({
      image: {
        src: '/api/media/file/a.jpg',
        alt: 'A lecture hall',
        width: 1600,
        height: 900,
        focus: '40% 70%',
      },
      primary: { label: 'Explore Programs', href: '/academics', icon: 'cap' },
      secondary: { label: 'Admissions', href: 'https://example.test/a', icon: 'document' },
    })
    expect(out[1]!.image).not.toHaveProperty('focus')
  })

  it('skips a slide whose picture cannot be shown or whose button is incomplete, and falls back below three', () => {
    const bad = [
      slide({ image: 7 }),
      slide({ image: media({ alt: '' }) }),
      slide({ image: media({ url: null }) }),
      slide({ secondary: { label: 'x', href: '' } }),
    ]
    expect(toHeroSlides({ slides: [...bad, slide(), slide()] }, heroSlides)).toBe(heroSlides)
    expect(toHeroSlides({ slides: [...bad, slide(), slide(), slide()] }, heroSlides)).toHaveLength(
      3,
    )
  })
})

describe('toStats', () => {
  it('uses the files when the global is missing or short', () => {
    expect(toStats(null, stats)).toBe(stats)
    expect(toStats({ stats: [stat(), stat()] }, stats)).toBe(stats)
  })

  it('maps figures with their source, date and sample flag', () => {
    const out = toStats(
      {
        stats: [
          stat(),
          stat({ value: 0, suffix: '', sample: true, source: null, verifiedAt: null }),
          stat({ label: 'Faculty', icon: 'person' }),
        ],
      },
      stats,
    )
    expect(out).toHaveLength(3)
    expect(out[0]).toEqual({
      id: 'home-stat-1',
      value: 80,
      suffix: '+',
      label: 'Programs',
      icon: 'cap',
      source: 'Registrar',
      verifiedAt: '2026-11-08',
    })
    expect(out[1]).toEqual({
      id: 'home-stat-2',
      value: 0,
      label: 'Programs',
      icon: 'cap',
      sample: true,
    })
  })

  it('drops a figure with no label or icon', () => {
    const out = toStats(
      { stats: [stat({ label: '' }), stat({ icon: null }), stat(), stat(), stat()] },
      stats,
    )
    expect(out).toHaveLength(3)
  })
})

describe('toAdmissions', () => {
  it('uses the file when the global holds nothing (null, or a group of empty fields)', () => {
    expect(toAdmissions(null, admissions).deadlineISO).toBe(admissions.deadlineISO)
    const empty = {
      session: null,
      deadline: null,
      applyUrl: null,
      closedUrl: null,
      closedDetail: null,
      servicesHeading: null,
    }
    const out = toAdmissions({ admissions: empty }, admissions)
    expect(out).toMatchObject({
      session: admissions.session,
      deadlineISO: admissions.deadlineISO,
      applyUrl: admissions.applyUrl,
    })
  })

  it('takes the edited fields and keeps the others', () => {
    const out = toAdmissions(
      {
        admissions: {
          session: ' Spring 2027 ',
          deadline: '2027-01-15T12:00:00.000Z',
          closedDetail: '',
        },
      },
      admissions,
    )
    expect(out.session).toBe('Spring 2027')
    expect(out.deadlineISO).toBe('2027-01-15T23:59:59+05:00')
    expect(out.closedDetail).toBe(admissions.closedDetail)
    expect(out.applyUrl).toBe(admissions.applyUrl)
  })

  it('an editor who fills the group but leaves the date empty gets Closed, not the old date', () => {
    const out = toAdmissions({ admissions: { session: 'Fall 2027' } }, admissions)
    expect(new Date(out.deadlineISO).getTime()).toBeLessThan(Date.now())
  })
})

describe('toPortals', () => {
  const row = (over: Record<string, unknown> = {}) => ({
    title: 'Library',
    description: 'Books and journals',
    href: '/library',
    icon: 'book' as const,
    ...over,
  })

  it('uses the file for no rows or too few usable rows', () => {
    expect(toPortals(null, portals)).toBe(portals)
    expect(toPortals({ portals: [row(), row()] }, portals)).toBe(portals)
    expect(toPortals({ portals: [row(), row(), row({ href: '' })] }, portals)).toBe(portals)
  })

  it('maps three or more complete rows in order, with stable ids', () => {
    const out = toPortals(
      {
        portals: [
          row({ title: 'A' }),
          row({ title: 'B' }),
          row({ title: 'C' }),
          row({ title: 'D', icon: 'gear' }),
        ],
      },
      portals,
    )
    expect(out.map((p) => p.title)).toEqual(['A', 'B', 'C', 'D'])
    expect(out.map((p) => p.id)).toEqual([
      'home-portal-1',
      'home-portal-2',
      'home-portal-3',
      'home-portal-4',
    ])
    expect(out[3]).toEqual({
      id: 'home-portal-4',
      title: 'D',
      description: 'Books and journals',
      href: '/library',
      icon: 'gear',
    })
  })
})

const vcPhoto = { src: '/images/vc.webp', alt: 'The standard portrait', width: 450, height: 438 }

describe('toLeadership', () => {
  it('keeps the sourced message and photograph when nothing is entered', () => {
    const base = { ...leadership, photo: vcPhoto }
    expect(toLeadership(null, leadership, vcPhoto)).toEqual(base)
    expect(toLeadership({ leadership: {} }, leadership, vcPhoto)).toEqual(base)
    expect(
      toLeadership({ leadership: { name: '  ', paragraphs: [{ text: ' ' }, { text: null }] } }, leadership, vcPhoto),
    ).toEqual(base)
  })

  it('replaces only the fields that were filled', () => {
    const out = toLeadership({ leadership: { name: ' New Name ', closing: 'Regards,' } }, leadership, vcPhoto)
    expect(out.name).toBe('New Name')
    expect(out.closing).toBe('Regards,')
    expect(out.role).toBe(leadership.role)
    expect(out.quote).toBe(leadership.quote)
    expect(out.fullMessage).toEqual(leadership.fullMessage)
    expect(out.photo).toEqual(vcPhoto)
  })

  it('takes the paragraphs in order, drops empty ones and counts them as complete', () => {
    const out = toLeadership(
      { leadership: { paragraphs: [{ text: 'One' }, { text: '' }, { text: ' Two ' }, { text: 'Three' }] } },
      { ...leadership, fullMessageComplete: false },
      vcPhoto,
    )
    expect(out.fullMessage).toEqual(['One', 'Two', 'Three'])
    expect(out.fullMessageComplete).toBe(true)
  })

  it('uses the uploaded photograph when it can be shown, and the standard one otherwise', () => {
    const up = { url: '/api/media/file/vc.png', alt: 'New portrait', width: 800, height: 900, focalX: 40, focalY: 20 }
    expect(toLeadership({ leadership: { photo: up } }, leadership, vcPhoto).photo).toEqual({
      src: '/api/media/file/vc.png',
      alt: 'New portrait',
      width: 800,
      height: 900,
      focus: '40% 20%',
    })
    // a bare id (not loaded), a missing alt text or no size cannot be shown
    expect(toLeadership({ leadership: { photo: 7 } }, leadership, vcPhoto).photo).toEqual(vcPhoto)
    expect(toLeadership({ leadership: { photo: { ...up, alt: '' } } }, leadership, vcPhoto).photo).toEqual(vcPhoto)
    expect(toLeadership({ leadership: { photo: { ...up, width: null } } }, leadership, vcPhoto).photo).toEqual(vcPhoto)
  })
})

describe('toHeroContent', () => {
  it('keeps the sourced words when nothing is entered', () => {
    expect(toHeroContent(null, hero)).toBe(hero)
    expect(toHeroContent({ hero: {} }, hero)).toEqual(hero)
    expect(toHeroContent({ hero: { lineOne: '  ', accent: null, sub: '' } }, hero)).toEqual(hero)
  })

  it('replaces only the parts that were filled', () => {
    const out = toHeroContent({ hero: { lineTwo: ' Quality Learning ', sub: 'A new sentence.' } }, hero)
    expect(out.lines[0]).toEqual(hero.lines[0])
    expect(out.lines[1]).toEqual({ text: 'Quality Learning' })
    expect(out.lines[2]).toEqual(hero.lines[2])
    expect(out.sub).toBe('A new sentence.')
    expect(out.eyebrow).toBe(hero.eyebrow)
  })

  it('builds the third line from its words and the highlighted word', () => {
    expect(toHeroContent({ hero: { accent: 'Impact' } }, hero).lines[2]).toEqual({ text: 'with', accent: 'Impact' })
    expect(toHeroContent({ hero: { lineThree: 'and', accent: 'Purpose' } }, hero).lines[2]).toEqual({
      text: 'and',
      accent: 'Purpose',
    })
    expect(toHeroContent({ hero: { lineThree: 'and' } }, hero).lines[2]).toEqual({ text: 'and', accent: 'Relevance' })
  })
})
