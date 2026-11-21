// @vitest-environment node
/* eslint-disable @typescript-eslint/no-explicit-any -- stored shapes are read loosely and checked by the assertions */
/**
 * Slice 3ad: a department carries its whole public page in the CMS (docs/briefs/p3ad-academics-departments.md).
 * Real Postgres, access enforced the way the admin does it. Departments are created by a platform admin.
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

const pageContent = (extra: Record<string, any> = {}) => ({
  shortName: 'DCST',
  tagline: 'Computing for the valley.',
  intro: 'Software, networks and data.',
  about: [{ text: 'First paragraph.' }, { text: 'Second paragraph.' }],
  highlights: [{ icon: 'code', title: 'Hands on', text: 'Labs from the first week.' }],
  labs: [{ title: 'Network lab', text: 'Routers and switches.', tools: ['Cisco', 'Wireshark'] }],
  researchAreas: [{ icon: 'brain', title: 'Learning', text: 'Models.', tags: ['AI', 'ML'] }],
  careers: [{ icon: 'briefcase', title: 'Software engineer', text: 'Product teams.' }],
  studentLife: [{ icon: 'users', title: 'Society', text: 'Weekly meetings.' }],
  faq: [{ question: 'Is there a hostel?', answer: 'Yes.' }],
  location: 'Main campus',
  officeHours: 'Mon to Fri, 9 to 4',
  ...extra,
})

const make = (content: Record<string, any> = pageContent(), extra: Record<string, any> = {}) =>
  payload.create({
    collection: 'departments',
    draft: true,
    data: { name: uniq('dept'), governance: gov, pageContent: content, ...extra } as never,
    ...as(admin),
  }) as Promise<{ id: number }>

const read = (id: number, locale: 'en' | 'ur' = 'en') =>
  payload.findByID({
    collection: 'departments',
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
      collection: 'departments',
      id,
      draft: true,
      data: { governance } as never,
      ...as(user),
    })
  }
}
const publish = (id: number) =>
  payload.update({
    collection: 'departments',
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

describe('a department built only from the new fields', () => {
  it('stores and returns every section exactly as written', async () => {
    const d = await make()
    const c = (await read(d.id)).pageContent!
    expect(c.shortName).toBe('DCST')
    expect(c.tagline).toBe('Computing for the valley.')
    expect(c.about.map((r: { text: string }) => r.text)).toEqual([
      'First paragraph.',
      'Second paragraph.',
    ])
    expect(c.highlights[0]).toMatchObject({ icon: 'code', title: 'Hands on' })
    expect(c.labs[0]).toMatchObject({ title: 'Network lab' })
    expect(c.labs[0].tools).toEqual(['Cisco', 'Wireshark'])
    expect(c.researchAreas[0].tags).toEqual(['AI', 'ML'])
    expect(c.careers[0].icon).toBe('briefcase')
    expect(c.studentLife[0].title).toBe('Society')
    expect(c.faq[0]).toMatchObject({ question: 'Is there a hostel?', answer: 'Yes.' })
    expect(c.location).toBe('Main campus')
    expect(c.officeHours).toBe('Mon to Fri, 9 to 4')
  })

  it('keeps the new fields in saved versions', async () => {
    const d = await make()
    const v = (await payload.findVersions({
      collection: 'departments',
      where: { parent: { equals: d.id } },
      depth: 0,
      overrideAccess: true,
    })) as unknown as { docs: { version: { pageContent?: { tagline?: string } } }[] }
    expect(v.docs[0].version.pageContent?.tagline).toBe('Computing for the valley.')
  })

  it('translates the words in a row without rebuilding the row (Urdu), and falls back to English', async () => {
    const d = await make()
    const en = (await read(d.id)).pageContent!
    const rowId = en.highlights[0].id
    await payload.update({
      collection: 'departments',
      id: d.id,
      draft: true,
      locale: 'ur',
      data: {
        pageContent: { highlights: [{ id: rowId, icon: 'code', title: 'عملی کام' }] },
      } as never,
      ...as(admin),
    })
    const ur = (await read(d.id, 'ur')).pageContent!
    expect(ur.highlights).toHaveLength(1)
    expect(ur.highlights[0].title).toBe('عملی کام')
    // The icon is shared and the untranslated text falls back to English.
    expect(ur.highlights[0].icon).toBe('code')
    expect(ur.highlights[0].text).toBe('Labs from the first week.')
    // English is untouched.
    expect((await read(d.id, 'en')).pageContent!.highlights[0].title).toBe('Hands on')
  })

  it('lists departments by order', async () => {
    const a = await make(pageContent(), { order: 2 })
    const b = await make(pageContent(), { order: 1 })
    const found = await payload.find({
      collection: 'departments',
      where: { id: { in: [a.id, b.id] } },
      sort: 'order',
      draft: true,
      overrideAccess: true,
      depth: 0,
    })
    expect(found.docs.map((x) => x.id)).toEqual([b.id, a.id])
  })

  it('an editor can edit the page content of a department an admin created', async () => {
    const d = await make()
    const r = (await payload.update({
      collection: 'departments',
      id: d.id,
      draft: true,
      data: { pageContent: { tagline: 'A new tagline.' } } as never,
      ...as(editor),
    })) as unknown as { pageContent: { tagline: string; shortName: string } }
    expect(r.pageContent.tagline).toBe('A new tagline.')
    expect(r.pageContent.shortName).toBe('DCST')
  })
})

describe('plain text only, checked when the department is published', () => {
  const cases: [string, (bad: string) => Record<string, any>][] = [
    ['tagline', (bad) => pageContent({ tagline: bad })],
    ['introduction', (bad) => pageContent({ intro: bad })],
    ['an about paragraph', (bad) => pageContent({ about: [{ text: bad }] })],
    [
      'a highlight title',
      (bad) => pageContent({ highlights: [{ icon: 'code', title: bad, text: 'x' }] }),
    ],
    ['a lab tool', (bad) => pageContent({ labs: [{ title: 'Lab', text: 'x', tools: [bad] }] })],
    [
      'a research tag',
      (bad) =>
        pageContent({ researchAreas: [{ icon: 'brain', title: 't', text: 'x', tags: [bad] }] }),
    ],
    ['a question answer', (bad) => pageContent({ faq: [{ question: 'q', answer: bad }] })],
    ['the location', (bad) => pageContent({ location: bad })],
  ]
  const bads = ['<b>bold</b>', 'See [this](https://example.test)', 'Go to https://example.test']

  it.each(cases)(
    '%s: a draft may hold it, publishing refuses it, and plain words publish',
    async (_n, build) => {
      for (const bad of bads) {
        const d = await make(build(bad))
        await approve(d.id)
        const msg = await publishError(d.id)
        expect(msg, `${_n} / ${bad}`).not.toBeNull()
        expect(msg).toMatch(/plain words/i)
      }
      // Control: the same field with plain words goes live, so the refusal above is the rule.
      const ok = await make(build('Plain words only.'))
      await approve(ok.id)
      expect(await publishError(ok.id)).toBeNull()
    },
  )
})

describe('pictures are checked by the publish guard, even inside a lab row', () => {
  it('refuses a lab picture with unknown rights and with no alt text; accepts a licensed one with alt', async () => {
    const noRights = await picture({ alt: 'Lab bench' })
    const d1 = await make(pageContent({ labs: [{ title: 'Lab', text: 'x', image: noRights.id }] }))
    await approve(d1.id)
    expect(await publishError(d1.id)).toMatch(/rights/i)

    const noAlt = await picture({ rightsStatus: 'licensed' })
    const d2 = await make(pageContent({ labs: [{ title: 'Lab', text: 'x', image: noAlt.id }] }))
    await approve(d2.id)
    expect(await publishError(d2.id)).toMatch(/alt/i)

    // Control: licensed and described, in the same place, publishes.
    const good = await picture(
      { alt: 'A lab bench with routers', rightsStatus: 'licensed' },
      approver,
    )
    const d3 = await make(pageContent({ labs: [{ title: 'Lab', text: 'x', image: good.id }] }))
    await approve(d3.id)
    expect(await publishError(d3.id)).toBeNull()
  })

  it('checks the hero and the campus photo the same way', async () => {
    const bad = await picture({ alt: 'Building' })
    for (const field of ['heroImage', 'campusPhoto']) {
      const d = await make(pageContent({ [field]: bad.id }))
      await approve(d.id)
      expect(await publishError(d.id), field).toMatch(/rights/i)
    }
  })
})

describe('limits and the icon list', () => {
  it('refuses a list over its maximum when publishing, and accepts it at the maximum', async () => {
    const row = { icon: 'code', title: 'T', text: 'x' }
    const over = await make(pageContent({ highlights: Array.from({ length: 7 }, () => row) }))
    await approve(over.id)
    expect(await publishError(over.id)).not.toBeNull()

    const atMax = await make(pageContent({ highlights: Array.from({ length: 6 }, () => row) }))
    await approve(atMax.id)
    expect(await publishError(atMax.id)).toBeNull()
  })

  it('refuses an icon that the pages cannot draw, at save (the database column is a closed list)', async () => {
    // The admin select cannot send one; this is a script or a bad import. It fails at save, not later.
    await expect(
      make(pageContent({ highlights: [{ icon: 'skull', title: 'T', text: 'x' }] })),
    ).rejects.toBeTruthy()
  })

  it('a department with none of the new fields still publishes (nothing already live breaks)', async () => {
    const d = (await payload.create({
      collection: 'departments',
      draft: true,
      data: { name: uniq('plain'), governance: gov } as never,
      ...as(admin),
    })) as { id: number }
    await approve(d.id)
    expect(await publishError(d.id)).toBeNull()
  })
})
