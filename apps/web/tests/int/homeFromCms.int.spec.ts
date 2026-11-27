// @vitest-environment node
/**
 * The home page's slider and statistics come from the published `home-content` global
 * (docs/briefs/home-from-cms.md). Real Postgres, real image bytes. The global is one row shared with other
 * test files, so nothing here assumes it starts empty; the fallback to the files is covered in homeMap.unit.spec.ts.
 */
import { randomBytes } from 'node:crypto'

import type { Payload } from 'payload'
import sharp from 'sharp'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import {
  getAdmissions,
  getHero,
  getHomeColours,
  getPortals,
  getStats,
} from '../../src/site/lib/content'
import { as, getTestPayload, makeUser } from '../helpers/governance'

let payload: Payload
let approver: Awaited<ReturnType<typeof makeUser>>
let editor: Awaited<ReturnType<typeof makeUser>>
let media: number[] = []

async function upload(alt: string) {
  const raw = randomBytes(40 * 30 * 3)
  const data = await sharp(raw, { raw: { width: 40, height: 30, channels: 3 } })
    .png()
    .toBuffer()
  const m = await payload.create({
    collection: 'media',
    data: { alt, rightsStatus: 'owned' } as never,
    file: {
      data,
      mimetype: 'image/png',
      name: `hfc-${Date.now()}-${Math.random()}.png`,
      size: data.length,
    },
    ...as(approver),
  })
  return m.id as number
}

const slide = (image: number, label: string) => ({
  image,
  primary: { label, href: '/academics', icon: 'cap' },
  secondary: { label: 'Admissions', href: 'https://example.test/admissions', icon: 'document' },
})
const stat = (label: string, value: number) => ({
  value,
  suffix: '+',
  label,
  icon: 'cap',
  source: 'Sample source for this test',
  verifiedAt: '2026-11-08T00:00:00.000Z',
})
const content = (tag: string) => ({
  slides: [
    slide(media[0]!, `${tag} one`),
    slide(media[1]!, `${tag} two`),
    slide(media[2]!, `${tag} three`),
  ],
  stats: [stat(`${tag} A`, 11), stat(`${tag} B`, 22), stat(`${tag} C`, 33)],
})
const publish = (data: Record<string, unknown>) =>
  payload.updateGlobal({
    slug: 'home-content',
    data: { ...data, _status: 'published' } as never,
    ...as(approver),
  })
const saveDraft = (data: Record<string, unknown>) =>
  payload.updateGlobal({ slug: 'home-content', data: data as never, draft: true, ...as(editor) })

beforeAll(async () => {
  payload = await getTestPayload()
  approver = await makeUser(payload, 'approver', ['registrar'])
  editor = await makeUser(payload, 'editor', ['registrar'])
  media = [
    await upload('First photograph'),
    await upload('Second photograph'),
    await upload('Third photograph'),
  ]
})

describe('home page reads the home-content global', () => {
  it('shows the published slides and figures, with the picture, alt text and buttons', async () => {
    await publish(content('Pub'))
    const { slides } = await getHero()
    expect(slides.map((s) => s.primary.label)).toEqual(['Pub one', 'Pub two', 'Pub three'])
    expect(slides[0]!.image.alt).toBe('First photograph')
    expect(slides[0]!.image.src).toMatch(/hfc-.*\.png/)
    expect(slides[0]!.image.width).toBe(40)
    expect(slides[0]!.secondary).toEqual({
      label: 'Admissions',
      href: 'https://example.test/admissions',
      icon: 'document',
    })
    const figures = await getStats()
    expect(figures.map((s) => [s.label, s.value, s.suffix])).toEqual([
      ['Pub A', 11, '+'],
      ['Pub B', 22, '+'],
      ['Pub C', 33, '+'],
    ])
    expect(figures[0]).toMatchObject({
      source: 'Sample source for this test',
      verifiedAt: '2026-11-08',
    })
  })

  it('never shows a later unpublished draft to a visitor', async () => {
    await saveDraft(content('Draft'))
    expect((await getHero()).slides.map((s) => s.primary.label)).toEqual([
      'Pub one',
      'Pub two',
      'Pub three',
    ])
    expect((await getStats()).map((s) => s.label)).toEqual(['Pub A', 'Pub B', 'Pub C'])
  })

  it('shows the new text once the draft is published', async () => {
    await publish(content('Next'))
    expect((await getHero()).slides.map((s) => s.primary.label)).toEqual([
      'Next one',
      'Next two',
      'Next three',
    ])
    expect((await getStats())[0]!.label).toBe('Next A')
  })

  it('hands the home page the published colours, and never a draft colour', async () => {
    await publish({
      ...content('Col'),
      colours: { green: '#10253f', yellow: '#f2b705', maroon: '#6b1a2b' },
    })
    expect(await getHomeColours()).toMatchObject({
      green: '#10253f',
      yellow: '#f2b705',
      maroon: '#6b1a2b',
    })
    await saveDraft({ ...content('Col'), colours: { green: '#0a3d2e' } })
    expect((await getHomeColours())?.green).toBe('#10253f')
    await publish({ ...content('Col'), colours: { green: null, yellow: null, maroon: null } })
    expect((await getHomeColours())?.green ?? null).toBeNull()
  })

  it('hands the home page the published admissions bar and portal cards, never the draft', async () => {
    const adm = {
      session: 'Spring 2099',
      deadline: '2099-02-01',
      applyUrl: '/apply',
      closedUrl: '/closed',
      closedDetail: 'Closed for now',
      servicesHeading: 'Explore',
    }
    const card = (t: string) => ({
      title: t,
      description: `${t} line`,
      href: `/${t}`,
      icon: 'book',
    })
    await publish({
      ...content('Adm'),
      admissions: adm,
      portals: [card('one'), card('two'), card('three')],
    })
    const a = await getAdmissions()
    expect(a).toMatchObject({
      session: 'Spring 2099',
      applyUrl: '/apply',
      closedDetail: 'Closed for now',
    })
    expect(a.deadlineISO).toBe('2099-02-01T23:59:59+05:00')
    expect((await getPortals()).map((p) => p.title)).toEqual(['one', 'two', 'three'])
    await saveDraft({
      admissions: { session: 'Draft only' },
      portals: [card('x'), card('y'), card('z')],
    })
    expect((await getAdmissions()).session).toBe('Spring 2099')
    expect((await getPortals()).map((p) => p.title)).toEqual(['one', 'two', 'three'])
  })
})
