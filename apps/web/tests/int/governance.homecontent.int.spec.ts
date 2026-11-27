// @vitest-environment node
/**
 * Slice 3z: the `home-content` global, the home page's slider and statistics bar
 * (docs/briefs/p3z-home-content-global.md). Real Postgres, real image bytes, access enforced.
 */
import { randomBytes } from 'node:crypto'

import { revalidatePath, revalidateTag } from 'next/cache'
import type { Payload } from 'payload'
import sharp from 'sharp'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import type { User } from '../../src/payload-types'
import { as, can, getTestPayload, makeUser, refusal } from '../helpers/governance'

let payload: Payload
let admin: User, manager: User, approver: User, editor: User, contributor: User, auditor: User
let m1: number, m2: number, m3: number

const SLUG = 'home-content' as const

async function upload(extra: Record<string, unknown>, asSystem = false) {
  const raw = randomBytes(40 * 30 * 3)
  const data = await sharp(raw, { raw: { width: 40, height: 30, channels: 3 } })
    .png()
    .toBuffer()
  const m = await payload.create({
    collection: 'media',
    data: extra as never,
    file: {
      data,
      mimetype: 'image/png',
      name: `home-${Date.now()}-${Math.random()}.png`,
      size: data.length,
    },
    ...(asSystem ? { overrideAccess: true, context: { disableRevalidate: true } } : as(approver)),
  })
  return m.id as number
}

const slide = (image: number, over: Record<string, unknown> = {}) => ({
  image,
  primary: { label: 'Explore Programs', href: '/academics', icon: 'cap' },
  secondary: { label: 'Admissions', href: 'https://example.test/admissions', icon: 'document' },
  ...over,
})
const stat = (over: Record<string, unknown> = {}) => ({
  value: 80,
  suffix: '+',
  label: 'Academic Programs',
  icon: 'cap',
  source: 'Given by the project owner, 2026-11-08 (no document seen)',
  verifiedAt: '2026-11-08T00:00:00.000Z',
  ...over,
})
// `colours` is cleared here so a colour saved by an earlier case never leaks into the next (the global is one row).
const complete = () => ({
  colours: { green: null, yellow: null, maroon: null },
  slides: [slide(m1), slide(m2), slide(m3)],
  stats: [stat(), stat({ label: 'Students', value: 9000 }), stat({ label: 'Faculty', value: 150 })],
})

const draft = (u: User, data: Record<string, unknown>) =>
  payload.updateGlobal({ slug: SLUG, data: data as never, draft: true, ...as(u) })
const publish = (u: User, data: Record<string, unknown>) =>
  payload.updateGlobal({
    slug: SLUG,
    data: { ...data, _status: 'published' } as never,
    ...as(u),
  })
type Home = {
  slides?: Array<{ primary?: { label?: string } }>
  stats?: unknown[]
  _status?: string
}
const live = (u?: User) =>
  payload.findGlobal({
    slug: SLUG,
    depth: 0,
    ...(u ? as(u) : { overrideAccess: false }),
  }) as Promise<Home>

beforeAll(async () => {
  payload = await getTestPayload()
  ;[admin, manager, approver, editor, contributor, auditor] = await Promise.all([
    makeUser(payload, 'platformAdmin'),
    makeUser(payload, 'siteManager'),
    makeUser(payload, 'approver', ['registrar']),
    makeUser(payload, 'editor', ['registrar']),
    makeUser(payload, 'contributor', ['registrar']),
    makeUser(payload, 'auditor'),
  ])
  const ok = { alt: 'A lecture hall', rightsStatus: 'owned' }
  ;[m1, m2, m3] = [await upload(ok), await upload(ok), await upload(ok)]
})
beforeEach(() => {
  vi.mocked(revalidateTag).mockClear()
  vi.mocked(revalidatePath).mockClear()
})

describe('who can change it', () => {
  it('an editor saves a draft, even an incomplete one, but cannot publish', async () => {
    const saved = await draft(editor, {
      slides: [slide(m1, { primary: { label: 'x', href: 'javascript:alert(1)' } })],
      stats: [stat({ source: '', verifiedAt: null })],
    })
    expect(saved._status).toBe('draft')
    expect(await refusal(() => publish(editor, complete()))).toBe('HOME_PUBLISH_FORBIDDEN')
  })

  it('an approver, a site manager and a platform admin can publish a complete one', async () => {
    for (const u of [approver, manager, admin]) {
      const out = (await publish(u, complete())) as Home
      expect(out._status, u.role as string).toBe('published')
    }
  })

  it('a contributor and an auditor cannot change it; an auditor can read it, drafts included', async () => {
    for (const u of [contributor, auditor]) {
      expect(await can(() => draft(u, complete())), u.role as string).toBe(false)
      expect(await can(() => publish(u, complete())), u.role as string).toBe(false)
    }
    expect(await can(() => payload.findGlobal({ slug: SLUG, draft: true, ...as(auditor) }))).toBe(
      true,
    )
  })
})

describe('what must be true to publish', () => {
  const stats = (n: number) => Array.from({ length: n }, (_, i) => stat({ label: `Figure ${i}` }))
  const slides = (n: number) => Array.from({ length: n }, () => slide(m1))
  const cases: Array<[string, () => Record<string, unknown>]> = [
    ['two slides', () => ({ ...complete(), slides: slides(2) })],
    ['nine slides', () => ({ ...complete(), slides: slides(9) })],
    ['two statistics', () => ({ ...complete(), stats: stats(2) })],
    ['seven statistics', () => ({ ...complete(), stats: stats(7) })],
    ...[
      'javascript:alert(1)',
      'data:text/html,x',
      'http://example.test',
      '//evil.test',
      'mailto:a@b.test',
    ].map((href): [string, () => Record<string, unknown>] => [
      `a slide link of ${href}`,
      () => ({
        ...complete(),
        slides: [slide(m1, { primary: { label: 'x', href } }), slide(m2), slide(m3)],
      }),
    ]),
    [
      'a statistic with no source',
      () => ({ ...complete(), stats: [stat({ source: '' }), stat(), stat()] }),
    ],
    [
      'a statistic with no date',
      () => ({ ...complete(), stats: [stat({ verifiedAt: null }), stat(), stat()] }),
    ],
  ]

  it('control: the complete content publishes, so each refusal below is about its one defect', async () => {
    expect(((await publish(approver, complete())) as Home)._status).toBe('published')
  })

  it.each(cases)(
    'refuses %s at publish, and the same content saves as a draft',
    async (_label, make) => {
      expect(await can(() => publish(approver, make()))).toBe(false)
      expect(await can(() => draft(editor, make()))).toBe(true)
    },
  )

  it('no slides at all publishes: the site then keeps its standard photographs', async () => {
    const out = (await publish(approver, { ...complete(), slides: [] })) as Home
    expect(out._status).toBe('published')
    expect(out.slides ?? []).toHaveLength(0)
  })

  it('any colour publishes, however pale or dark: the owner has the final say', async () => {
    const out = (await publish(approver, {
      ...complete(),
      colours: { green: '#6b6b6b', yellow: '#b3a26f', maroon: '#e0a0a8' },
    })) as Home & { colours?: Record<string, string> }
    expect(out._status).toBe('published')
    expect(out.colours).toMatchObject({ green: '#6b6b6b', yellow: '#b3a26f', maroon: '#e0a0a8' })
  })

  it.each(['red', '#fff', '#00;}body{display:none', 'url(x)'])(
    'a colour of %s is refused at publish',
    async (bad) => {
      expect(await can(() => publish(approver, { ...complete(), colours: { green: bad } }))).toBe(
        false,
      )
    },
  )

  it('a sample statistic needs no source or date', async () => {
    const out = (await publish(approver, {
      ...complete(),
      stats: [stat({ sample: true, source: '', verifiedAt: null }), stat(), stat()],
    })) as Home
    expect(out._status).toBe('published')
  })
})

describe('the pictures', () => {
  it('a picture with no alt text, or no recorded rights, refuses the publish and names the slide', async () => {
    // Uploads without alt text or rights come from trusted server code (the importer), not from staff.
    const noAlt = await upload({ rightsStatus: 'owned' }, true)
    const noRights = await upload({ alt: 'A lawn' }, true)
    for (const [bad, what] of [
      [noAlt, /slide 2.*no alt text/i],
      [noRights, /slide 2.*no recorded rights/i],
    ] as const) {
      let message = ''
      const code = await refusal(async () => {
        try {
          await publish(approver, { ...complete(), slides: [slide(m1), slide(bad), slide(m3)] })
        } catch (e) {
          message = (e as Error).message
          throw e
        }
      })
      expect(code).toBe('HOME_MEDIA_PROBLEM')
      expect(message).toMatch(what)
    }
  })

  it('a slide whose picture was deleted is refused', async () => {
    const gone = await upload({ alt: 'Soon gone', rightsStatus: 'owned' })
    await payload.delete({
      collection: 'media',
      id: gone,
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
    expect(
      await can(() =>
        publish(approver, { ...complete(), slides: [slide(m1), slide(gone), slide(m3)] }),
      ),
    ).toBe(false)
  })
})

describe('deleting a picture the home page uses', () => {
  it('is refused while a slide (even only in the newest draft) shows it, and allowed once it is replaced', async () => {
    const pic = await upload({ alt: 'Used on the home page', rightsStatus: 'owned' })
    await draft(editor, { slides: [slide(pic), slide(m2), slide(m3)] })
    let message = ''
    let status = 0
    try {
      await payload.delete({ collection: 'media', id: pic, overrideAccess: true })
    } catch (e) {
      message = (e as Error).message
      status = (e as { status?: number }).status ?? 0
    }
    expect(status).toBe(409)
    expect(message).toContain('Home page content')
    expect(
      await payload.findByID({ collection: 'media', id: pic, overrideAccess: true }),
    ).toBeTruthy()

    await draft(editor, { slides: [slide(m1), slide(m2), slide(m3)] })
    await payload.delete({ collection: 'media', id: pic, overrideAccess: true })
    await expect(
      payload.findByID({ collection: 'media', id: pic, overrideAccess: true }),
    ).rejects.toBeTruthy()
  })
})

describe('what the public sees', () => {
  it('only the published version, never a draft', async () => {
    await publish(approver, {
      ...complete(),
      slides: [
        slide(m1, { primary: { label: 'Published label', href: '/academics' } }),
        slide(m2),
        slide(m3),
      ],
    })
    await draft(editor, {
      slides: [
        slide(m1, { primary: { label: 'Draft label', href: '/academics' } }),
        slide(m2),
        slide(m3),
      ],
    })

    const publicRead = await live()
    expect(publicRead.slides?.[0]?.primary?.label).toBe('Published label')

    // Asking for the draft as a signed-out reader gets nothing of it.
    let asked: Home | null = null
    try {
      asked = (await payload.findGlobal({
        slug: SLUG,
        depth: 0,
        draft: true,
        overrideAccess: false,
      })) as Home
    } catch {
      asked = null
    }
    expect(JSON.stringify(asked)).not.toContain('Draft label')

    // Staff asking for the draft do see it.
    const staff = (await payload.findGlobal({
      slug: SLUG,
      depth: 0,
      draft: true,
      ...as(editor),
    })) as Home
    expect(staff.slides?.[0]?.primary?.label).toBe('Draft label')
  })
})

describe('telling the public site', () => {
  const real = { user: undefined as unknown, context: {} }

  it('a publish refreshes the home tag and the home path, once each', async () => {
    await payload.updateGlobal({
      slug: SLUG,
      data: { ...complete(), _status: 'published' } as never,
      overrideAccess: true,
      ...real,
    } as never)
    expect(
      vi.mocked(revalidateTag).mock.calls.filter((c) => c[0] === 'global_home-content'),
    ).toEqual([['global_home-content', 'max']])
    expect(vi.mocked(revalidatePath).mock.calls).toEqual([['/']])
  })

  it('nothing is refreshed when the request switches it off', async () => {
    await publish(approver, complete())
    expect(revalidateTag).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('a failing refresh never blocks the save', async () => {
    vi.mocked(revalidateTag).mockImplementationOnce(() => {
      throw new Error('cache unavailable')
    })
    const out = (await payload.updateGlobal({
      slug: SLUG,
      data: { ...complete(), _status: 'published' } as never,
      overrideAccess: true,
      ...real,
    } as never)) as Home
    expect(out._status).toBe('published')
  })
})

describe('the audit log', () => {
  it('a change by an approver is recorded with the approver as the actor', async () => {
    await publish(approver, complete())
    const log = await payload.find({
      collection: 'audit-logs',
      where: {
        and: [{ collection: { equals: SLUG } }, { actorId: { equals: String(approver.id) } }],
      },
      sort: '-createdAt',
      limit: 1,
      overrideAccess: true,
      depth: 0,
    })
    expect(log.docs[0]).toMatchObject({ action: 'update', actorRole: 'approver' })
  })
})

describe('restoring an old version', () => {
  const versionWhere = async (status: 'published' | 'draft') => {
    const versions = await payload.findGlobalVersions({
      slug: SLUG,
      limit: 20,
      overrideAccess: true,
      depth: 0,
    })
    return versions.docs.find(
      (v) => (v as { version?: { _status?: string } }).version?._status === status,
    )!
  }
  const newerDraft = () =>
    draft(editor, {
      slides: [
        slide(m1, { primary: { label: 'Newer draft', href: '/academics' } }),
        slide(m2),
        slide(m3),
      ],
    })

  it('only a reviewer can put an old version live; the public read does not change when an editor tries', async () => {
    await publish(approver, complete())
    const old = await versionOf('published')
    await newerDraft()
    const before = JSON.stringify(await live())
    expect(
      await refusal(() =>
        payload.restoreGlobalVersion({ slug: SLUG, id: old.id, depth: 0, ...as(editor) }),
      ),
    ).toBe('HOME_PUBLISH_FORBIDDEN')
    expect(JSON.stringify(await live())).toBe(before)
    // A reviewer can.
    expect(
      await can(() =>
        payload.restoreGlobalVersion({ slug: SLUG, id: old.id, depth: 0, ...as(approver) }),
      ),
    ).toBe(true)
  })

  // "Restore as draft" (`?draft=true`) exists only in REST and the admin, not in the Local API, so it is
  // checked against the running server instead (docs/predictions.md, P3z-d).

  async function versionOf(status: 'published' | 'draft') {
    return versionWhere(status)
  }
})
