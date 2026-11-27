// @vitest-environment node
/* eslint-disable @typescript-eslint/no-explicit-any -- stored shapes are read loosely and checked by the assertions */
/**
 * Slice 3ae: a programme carries its whole public page in the CMS (docs/briefs/p3ae-academics-programmes.md).
 * Real Postgres, access enforced the way the admin does it. Programmes are created by a platform admin.
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

import type { User } from '../../src/payload-types'
import { as, getTestPayload, makeUser, system, uniq } from '../helpers/governance'

let payload: Payload
let admin: User, editor: User, approver: User

const gov = { ownerOffice: 'Registrar', source: 'https://example.test/source' }

async function picture(extra: Record<string, any>, who: User | 'system' = 'system') {
  const data = await sharp(randomBytes(40 * 30 * 3), {
    raw: { width: 40, height: 30, channels: 3 },
  })
    .png()
    .toBuffer()
  return (await payload.create({
    collection: 'media',
    data: extra as never,
    file: { data, mimetype: 'image/png', name: `${uniq('img')}.png`, size: data.length },
    ...(who === 'system' ? system : as(who)),
  })) as { id: number }
}

const row = { icon: 'code', title: 'Title', text: 'Text.' }
const content = (extra: Record<string, any> = {}) => ({
  shortName: 'BS CS',
  tagline: 'Learn to build software.',
  summary: 'Four years of programming, systems and projects.',
  about: [{ text: 'First paragraph.' }, { text: 'Second paragraph.' }],
  outcomes: [{ text: 'Design and build software.' }, { text: 'Work in a team.' }],
  whyStudy: [{ icon: 'rocket', title: 'Projects', text: 'A project every semester.' }],
  tracks: [{ icon: 'brain', title: 'AI', text: 'Machine learning.' }],
  skills: [{ group: 'Languages', items: ['Python', 'C++'] }],
  curriculum: [
    { year: 1, term: '1', courses: ['Programming Fundamentals', 'Calculus'] },
    { year: 1, term: '2', courses: ['Object Oriented Programming'] },
    { year: 2, term: '1', courses: ['Data Structures'] },
  ],
  careers: [{ icon: 'briefcase', title: 'Developer', text: 'Product teams.' }],
  faq: [{ question: 'Is there a scholarship?', answer: 'Ask the office.' }],
  ...extra,
})

const make = (c: Record<string, any> = content(), extra: Record<string, any> = {}) =>
  payload.create({
    collection: 'programmes',
    draft: true,
    data: { name: uniq('prog'), governance: gov, pageContent: c, ...extra } as never,
    ...as(admin),
  }) as Promise<{ id: number }>

const read = (id: number, locale: 'en' | 'ur' = 'en') =>
  payload.findByID({
    collection: 'programmes',
    id,
    draft: true,
    depth: 0,
    locale,
    overrideAccess: true,
  }) as unknown as Promise<{ pageContent?: Record<string, any>; order?: number | null }>

async function approve(id: number) {
  for (const [user, governance] of [
    [editor, { status: 'in_review' }],
    [approver, { status: 'approved', verificationStatus: 'verified' }],
  ] as const) {
    await payload.update({
      collection: 'programmes',
      id,
      draft: true,
      data: { governance } as never,
      ...as(user),
    })
  }
}
const publish = (id: number) =>
  payload.update({
    collection: 'programmes',
    id,
    data: { _status: 'published', governance: {} } as never,
    ...as(approver),
  })
/** Publish and return every message of the refusal (Payload keeps the field messages in `data`), or null if it went through. */
async function publishError(id: number): Promise<string | null> {
  try {
    await publish(id)
    return null
  } catch (e) {
    const err = e as Error & { data?: { errors?: { message?: string }[] } }
    return [err.message, ...(err.data?.errors ?? []).map((x) => x.message ?? '')].join(' | ')
  }
}

beforeAll(async () => {
  payload = await getTestPayload()
  ;[admin, editor, approver] = await Promise.all([
    makeUser(payload, 'platformAdmin'),
    makeUser(payload, 'editor', ['Registrar']),
    makeUser(payload, 'approver', ['Registrar']),
  ])
})

describe('a programme built only from the new fields', () => {
  it('stores and returns every section exactly as written', async () => {
    const p = await make()
    const c = (await read(p.id)).pageContent!
    expect(c.shortName).toBe('BS CS')
    expect(c.summary).toBe('Four years of programming, systems and projects.')
    expect(c.about.map((r: { text: string }) => r.text)).toEqual([
      'First paragraph.',
      'Second paragraph.',
    ])
    expect(c.outcomes.map((r: { text: string }) => r.text)).toEqual([
      'Design and build software.',
      'Work in a team.',
    ])
    expect(c.whyStudy[0]).toMatchObject({ icon: 'rocket', title: 'Projects' })
    expect(c.tracks[0]).toMatchObject({ icon: 'brain', title: 'AI' })
    expect(c.skills[0].group).toBe('Languages')
    expect(c.skills[0].items).toEqual(['Python', 'C++'])
    expect(c.careers[0].icon).toBe('briefcase')
    expect(c.faq[0].question).toBe('Is there a scholarship?')
  })

  it('keeps the curriculum as rows of year, term and course names, in order', async () => {
    const p = await make()
    const cur = (await read(p.id)).pageContent!.curriculum as {
      year: number
      term: string
      courses: string[]
    }[]
    expect(cur.map((r) => [r.year, r.term])).toEqual([
      [1, '1'],
      [1, '2'],
      [2, '1'],
    ])
    expect(cur[0].courses).toEqual(['Programming Fundamentals', 'Calculus'])
    expect(cur[2].courses).toEqual(['Data Structures'])
  })

  it('keeps the new fields in saved versions', async () => {
    const p = await make()
    const v = (await payload.findVersions({
      collection: 'programmes',
      where: { parent: { equals: p.id } },
      depth: 0,
      overrideAccess: true,
    })) as unknown as { docs: { version: { pageContent?: { tagline?: string } } }[] }
    expect(v.docs[0].version.pageContent?.tagline).toBe('Learn to build software.')
  })

  it('translates the words in a row (Urdu) and falls back to English for the rest', async () => {
    const p = await make()
    const en = (await read(p.id)).pageContent!
    const id = en.whyStudy[0].id
    await payload.update({
      collection: 'programmes',
      id: p.id,
      draft: true,
      locale: 'ur',
      data: { pageContent: { whyStudy: [{ id, icon: 'rocket', title: 'پراجیکٹس' }] } } as never,
      ...as(admin),
    })
    const ur = (await read(p.id, 'ur')).pageContent!
    expect(ur.whyStudy[0].title).toBe('پراجیکٹس')
    expect(ur.whyStudy[0].icon).toBe('rocket')
    expect(ur.whyStudy[0].text).toBe('A project every semester.')
    expect((await read(p.id, 'en')).pageContent!.whyStudy[0].title).toBe('Projects')
    // The curriculum is shared across languages.
    expect(ur.curriculum).toHaveLength(3)
  })

  it('lists programmes by order', async () => {
    const a = await make(content(), { order: 2 })
    const b = await make(content(), { order: 1 })
    const found = await payload.find({
      collection: 'programmes',
      where: { id: { in: [a.id, b.id] } },
      sort: 'order',
      draft: true,
      overrideAccess: true,
      depth: 0,
    })
    expect(found.docs.map((x) => x.id)).toEqual([b.id, a.id])
  })

  it('an editor can edit the page content of a programme an admin created', async () => {
    const p = await make()
    const r = (await payload.update({
      collection: 'programmes',
      id: p.id,
      draft: true,
      data: { pageContent: { tagline: 'A new tagline.' } } as never,
      ...as(editor),
    })) as unknown as { pageContent: { tagline: string; shortName: string } }
    expect(r.pageContent.tagline).toBe('A new tagline.')
    expect(r.pageContent.shortName).toBe('BS CS')
  })
})

describe('plain text only, checked when the programme is published', () => {
  const cases: [string, (bad: string) => Record<string, any>][] = [
    ['tagline', (bad) => content({ tagline: bad })],
    ['summary', (bad) => content({ summary: bad })],
    ['an about paragraph', (bad) => content({ about: [{ text: bad }] })],
    ['an outcome', (bad) => content({ outcomes: [{ text: bad }] })],
    ['a track title', (bad) => content({ tracks: [{ icon: 'brain', title: bad, text: 'x' }] })],
    ['a skill item', (bad) => content({ skills: [{ group: 'Languages', items: [bad] }] })],
    ['a course name', (bad) => content({ curriculum: [{ year: 1, term: '1', courses: [bad] }] })],
    ['a question answer', (bad) => content({ faq: [{ question: 'q', answer: bad }] })],
  ]
  const bads = ['<b>bold</b>', 'See [this](https://example.test)', 'Go to https://example.test']

  it.each(cases)(
    '%s: a draft may hold it, publishing refuses it, and plain words publish',
    async (_n, build) => {
      for (const bad of bads) {
        const p = await make(build(bad))
        await approve(p.id)
        const msg = await publishError(p.id)
        expect(msg, `${_n} / ${bad}`).not.toBeNull()
        expect(msg).toMatch(/plain words/i)
      }
      const ok = await make(build('Plain words only.'))
      await approve(ok.id)
      expect(await publishError(ok.id)).toBeNull()
    },
  )
})

describe('pictures are checked by the publish guard', () => {
  it('refuses a picture with unknown rights or no alt text in each of the three places; accepts a licensed one', async () => {
    const noRights = await picture({ alt: 'A classroom' })
    const noAlt = await picture({ rightsStatus: 'licensed' })
    for (const field of ['heroImage', 'tileImage', 'figureImage']) {
      const a = await make(content({ [field]: noRights.id }))
      await approve(a.id)
      expect(await publishError(a.id), `${field} rights`).toMatch(/rights/i)
      const b = await make(content({ [field]: noAlt.id }))
      await approve(b.id)
      expect(await publishError(b.id), `${field} alt`).toMatch(/alt/i)
    }
    const good = await picture({ alt: 'Students at a bench', rightsStatus: 'licensed' }, approver)
    const ok = await make(content({ heroImage: good.id, tileImage: good.id, figureImage: good.id }))
    await approve(ok.id)
    expect(await publishError(ok.id)).toBeNull()
  })
})

describe('limits', () => {
  it('refuses a list over its maximum when publishing, and accepts it at the maximum', async () => {
    const rows = (n: number) => Array.from({ length: n }, () => row)
    const lists: [string, number, Record<string, any>][] = [
      ['whyStudy', 6, { whyStudy: rows(7) }],
      ['tracks', 6, { tracks: rows(7) }],
      ['careers', 8, { careers: rows(9) }],
      ['faq', 12, { faq: Array.from({ length: 13 }, () => ({ question: 'q', answer: 'a' })) }],
      ['about', 4, { about: Array.from({ length: 5 }, () => ({ text: 'p' })) }],
      ['outcomes', 8, { outcomes: Array.from({ length: 9 }, () => ({ text: 'o' })) }],
      [
        'courses in a semester',
        8,
        {
          curriculum: [
            { year: 1, term: '1', courses: Array.from({ length: 9 }, (_, i) => `C${i}`) },
          ],
        },
      ],
    ]
    for (const [name, , over] of lists) {
      const p = await make(content(over))
      await approve(p.id)
      expect(await publishError(p.id), name).not.toBeNull()
    }
    // Control: the same lists at their maximum go live.
    const atMax = await make(
      content({
        whyStudy: rows(6),
        tracks: rows(6),
        careers: rows(8),
        faq: Array.from({ length: 12 }, () => ({ question: 'q', answer: 'a' })),
        about: Array.from({ length: 4 }, () => ({ text: 'p' })),
        outcomes: Array.from({ length: 8 }, () => ({ text: 'o' })),
        curriculum: [{ year: 1, term: '1', courses: Array.from({ length: 8 }, (_, i) => `C${i}`) }],
      }),
    )
    await approve(atMax.id)
    expect(await publishError(atMax.id)).toBeNull()
  })

  it('refuses a year outside 1 to 6 when publishing, and accepts 6', async () => {
    const bad = await make(content({ curriculum: [{ year: 7, term: '1', courses: ['X'] }] }))
    await approve(bad.id)
    expect(await publishError(bad.id)).not.toBeNull()
    const ok = await make(content({ curriculum: [{ year: 6, term: '2', courses: ['X'] }] }))
    await approve(ok.id)
    expect(await publishError(ok.id)).toBeNull()
  })

  it('refuses two rows for the same semester when publishing', async () => {
    const dup = await make(
      content({
        curriculum: [
          { year: 2, term: '1', courses: ['A'] },
          { year: 2, term: '1', courses: ['B'] },
        ],
      }),
    )
    await approve(dup.id)
    expect(await publishError(dup.id)).toMatch(/listed twice/i)
  })

  it('refuses a term other than 1 or 2 at save (the column is a closed list)', async () => {
    await expect(
      make(content({ curriculum: [{ year: 1, term: '3', courses: ['A'] }] })),
    ).rejects.toBeTruthy()
  })

  it('a programme with none of the new fields still publishes (nothing already live breaks)', async () => {
    const p = (await payload.create({
      collection: 'programmes',
      draft: true,
      data: { name: uniq('plain'), governance: gov } as never,
      ...as(admin),
    })) as { id: number }
    await approve(p.id)
    expect(await publishError(p.id)).toBeNull()
  })
})
