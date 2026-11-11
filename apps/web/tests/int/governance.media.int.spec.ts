// @vitest-environment node
/**
 * Slice 3f: media rules (CMS-06, MED-03, importer rule 4) and the publish guard (CMS-08).
 * Real image bytes, real Postgres, access enforced the way the admin does it.
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

import { NEEDS_ALT_WHERE } from '../../src/governance/mediaRules'
import { runLifecycleSweep } from '../../src/governance/sweep'
import type { User } from '../../src/payload-types'
import { as, getTestPayload, makeUser, refusal, system, uniq } from '../helpers/governance'

let payload: Payload
let editor: User, approver: User

/** A small real PNG of random pixels, so its hash is new every time. */
async function png(width = 40, height = 30) {
  const data = await sharp(randomBytes(width * height * 3), {
    raw: { width, height, channels: 3 },
  })
    .png()
    .toBuffer()
  return { data, mimetype: 'image/png', name: `${uniq('img')}.png`, size: data.length }
}

type Who = User | 'system'
async function upload(
  who: Who,
  extra: Record<string, unknown> = {},
  file?: Awaited<ReturnType<typeof png>>,
) {
  return payload.create({
    collection: 'media',
    data: extra as never,
    file: file ?? (await png()),
    ...(who === 'system' ? system : as(who)),
  })
}
const setMedia = (id: number, data: Record<string, unknown>, who: User = approver) =>
  payload.update({ collection: 'media', id, data: data as never, ...as(who) })

const heading = (tag: string) => ({
  type: 'heading',
  tag,
  version: 1,
  children: [{ type: 'text', text: 'Section', version: 1 }],
})
const paragraphWithLink = (label: string) => ({
  type: 'paragraph',
  version: 1,
  children: [
    {
      type: 'link',
      version: 1,
      fields: { url: 'https://example.test', linkType: 'custom' },
      children: [{ type: 'text', text: label, version: 1 }],
    },
  ],
})
const body = (...children: unknown[]) => ({
  root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children },
})

const gov = { ownerOffice: 'Registrar', source: 'https://example.test/source' }
async function approvedNotice(
  extra: Record<string, unknown> = {},
  g: Record<string, unknown> = {},
) {
  const n = (await payload.create({
    collection: 'notices',
    draft: true,
    data: {
      title: uniq('notice'),
      excerpt: 'Sample',
      ...extra,
      governance: { ...gov, ...g },
    } as never,
    ...as(editor),
  })) as { id: number }
  for (const [user, governance] of [
    [editor, { status: 'in_review' }],
    [approver, { status: 'approved', verificationStatus: 'verified' }],
  ] as const) {
    await payload.update({
      collection: 'notices',
      id: n.id,
      draft: true,
      data: { governance } as never,
      ...as(user),
    })
  }
  return n
}
const publish = (id: number) =>
  payload.update({
    collection: 'notices',
    id,
    data: { _status: 'published', governance: {} } as never,
    ...as(approver),
  })
const published = async (id: number) =>
  (await payload.findByID({ collection: 'notices', id, overrideAccess: true, depth: 0 }))._status

describe('media rules', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    ;[editor, approver] = await Promise.all([
      makeUser(payload, 'editor', ['Registrar']),
      makeUser(payload, 'approver', ['Registrar']),
    ])
  })

  it('refuses an upload by a person without alt text, and accepts one with it', async () => {
    expect(await refusal(() => upload(editor))).toBe('ALT_REQUIRED')
    expect(await refusal(() => upload(editor, { alt: '   ' }))).toBe('ALT_REQUIRED')
    const ok = await upload(editor, { alt: 'Students in a lecture hall' })
    expect(ok.alt).toBe('Students in a lecture hall')
    expect(ok.rightsStatus).toBe('unknown')
  })

  it('lets the system (importer) create without alt, and lists it in the needs-alt queue', async () => {
    const m = await upload('system', { sourcePage: 'https://example.test/old-page' })
    expect(m.alt ?? '').toBe('')
    const queue = await payload.find({
      collection: 'media',
      where: { and: [NEEDS_ALT_WHERE, { id: { equals: m.id } }] },
      overrideAccess: true,
      depth: 0,
    })
    expect(queue.totalDocs).toBe(1)
    const fixed = await setMedia(m.id, { alt: 'Main gate' })
    expect(fixed.alt).toBe('Main gate')
    const after = await payload.find({
      collection: 'media',
      where: { and: [NEEDS_ALT_WHERE, { id: { equals: m.id } }] },
      overrideAccess: true,
      depth: 0,
    })
    expect(after.totalDocs).toBe(0)
  })

  it('stops a person blanking the alt text of an existing image', async () => {
    const m = await upload(editor, { alt: 'Library' })
    expect(await refusal(() => setMedia(m.id, { alt: '' }))).toBe('ALT_REQUIRED')
  })

  it('records the file hash itself and refuses the same bytes twice, naming the first record', async () => {
    const file = await png(55, 33)
    const first = await upload(editor, { alt: 'First' }, file)
    expect(first.sha256).toMatch(/^[0-9a-f]{64}$/)
    let code: string | null = null
    let existingId: unknown
    try {
      await upload(editor, { alt: 'Again' }, file)
    } catch (e) {
      const err = e as { data?: { code?: string; existingId?: unknown } }
      code = err.data?.code ?? null
      existingId = err.data?.existingId
    }
    expect(code).toBe('MEDIA_DUPLICATE')
    expect(existingId).toBe(first.id)
  })

  it('ignores a hash sent by the request', async () => {
    const m = await upload(editor, { alt: 'Hash test', sha256: 'f'.repeat(64) })
    expect(m.sha256).not.toBe('f'.repeat(64))
    const edited = await setMedia(m.id, { sha256: 'e'.repeat(64), credit: 'Photo office' })
    expect(edited.sha256).toBe(m.sha256)
    expect(edited.credit).toBe('Photo office')
  })

  it('refuses SVG and PDF, and a file over the limit', async () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>')
    expect(
      await refusal(() =>
        upload(
          editor,
          { alt: 'x' },
          { data: svg, mimetype: 'image/svg+xml', name: 'a.svg', size: svg.length },
        ),
      ),
    ).not.toBeNull()
    const pdf = Buffer.from('%PDF-1.4 test')
    expect(
      await refusal(() =>
        upload(
          editor,
          { alt: 'x' },
          { data: pdf, mimetype: 'application/pdf', name: 'a.pdf', size: pdf.length },
        ),
      ),
    ).not.toBeNull()
    // A real PNG of random noise, about 9 MB.
    const noise = await sharp(randomBytes(1900 * 1900 * 3), {
      raw: { width: 1900, height: 1900, channels: 3 },
    })
      .png({ compressionLevel: 0 })
      .toBuffer()
    expect(noise.length).toBeGreaterThan(8 * 1024 * 1024)
    expect(
      await refusal(() =>
        upload(
          editor,
          { alt: 'Large' },
          { data: noise, mimetype: 'image/png', name: 'big.png', size: noise.length },
        ),
      ),
    ).toBe('MEDIA_TOO_LARGE')
  }, 60_000)

  it('lets only a reviewer record rights', async () => {
    expect(await refusal(() => upload(editor, { alt: 'x', rightsStatus: 'owned' }))).toBe(
      'RIGHTS_REVIEWER_ONLY',
    )
    const m = await upload(editor, { alt: 'Campus' })
    const owned = await setMedia(m.id, { rightsStatus: 'owned' })
    expect(owned.rightsStatus).toBe('owned')
    const byApprover = await upload(approver, { alt: 'Campus 2', rightsStatus: 'licensed' })
    expect(byApprover.rightsStatus).toBe('licensed')
  })
})

describe('publish guard', () => {
  const goodImage = async () =>
    upload(approver, { alt: 'A lecture hall', rightsStatus: 'owned', credit: 'Photo office' })

  it('blocks publishing a notice whose hero image has unknown rights, then allows it once recorded', async () => {
    const img = await upload(editor, { alt: 'Gate' })
    const n = await approvedNotice({ heroImage: img.id })
    expect(await refusal(() => publish(n.id))).toBe('MEDIA_RIGHTS_UNKNOWN')
    expect(await published(n.id)).not.toBe('published')
    await setMedia(img.id, { rightsStatus: 'permission_granted' })
    expect(await refusal(() => publish(n.id))).toBeNull()
    expect(await published(n.id)).toBe('published')
  })

  it('blocks a hero image with empty alt (an imported image) until alt is written', async () => {
    const img = await upload('system', { rightsStatus: 'owned' })
    const n = await approvedNotice({ heroImage: img.id })
    expect(await refusal(() => publish(n.id))).toBe('MEDIA_ALT_MISSING')
    await setMedia(img.id, { alt: 'Convocation' })
    expect(await refusal(() => publish(n.id))).toBeNull()
  })

  it('blocks a skipped heading level in the body and names the problem', async () => {
    const img = await goodImage()
    const n = await approvedNotice({
      heroImage: img.id,
      body: body(heading('h2'), heading('h4')),
    })
    expect(await refusal(() => publish(n.id))).toBe('HEADING_LEVEL_SKIPPED')
    await payload.update({
      collection: 'notices',
      id: n.id,
      draft: true,
      data: { body: body(heading('h2'), heading('h3')) } as never,
      ...as(editor),
    })
    // An edit puts it back in draft; take it through review again, as the policy requires.
    await payload.update({
      collection: 'notices',
      id: n.id,
      draft: true,
      data: { governance: { status: 'in_review' } } as never,
      ...as(editor),
    })
    await payload.update({
      collection: 'notices',
      id: n.id,
      draft: true,
      data: { governance: { status: 'approved', verificationStatus: 'verified' } } as never,
      ...as(approver),
    })
    expect(await refusal(() => publish(n.id))).toBeNull()
  })

  it('blocks a link that says "click here"', async () => {
    const img = await goodImage()
    const n = await approvedNotice({
      heroImage: img.id,
      body: body(heading('h2'), paragraphWithLink('click here')),
    })
    expect(await refusal(() => publish(n.id))).toBe('LINK_TEXT_BARE')
  })

  it('lets a draft be saved with the same faults', async () => {
    const img = await upload(editor, { alt: 'Gate' })
    const saved = await payload.create({
      collection: 'notices',
      draft: true,
      data: {
        title: uniq('faulty'),
        heroImage: img.id,
        body: body(heading('h2'), heading('h5'), paragraphWithLink('here')),
        governance: gov,
      } as never,
      ...as(editor),
    })
    expect(saved.id).toBeDefined()
  })

  it('judges the whole stored document when the publish request only carries the status', async () => {
    // The publish() helper sends only `_status`; the faulty body is in the stored draft.
    const img = await goodImage()
    const n = await approvedNotice({ heroImage: img.id, body: body(heading('h3')) })
    expect(await refusal(() => publish(n.id))).toBe('HEADING_LEVEL_SKIPPED')
  })

  it('stops a scheduled publish by the sweep, and reports why', async () => {
    const img = await upload('system', { rightsStatus: 'owned' })
    const n = await approvedNotice({ heroImage: img.id }, { publishAt: '2027-02-01T00:00:00.000Z' })
    const report = await runLifecycleSweep(payload, {
      now: new Date('2027-03-01T10:00:00.000Z'),
      collections: ['notices'],
      context: system.context,
    })
    expect(
      report.collections.notices.skipped.find((s) => String(s.id) === String(n.id)),
    ).toMatchObject({
      action: 'publish',
    })
    expect(await published(n.id)).not.toBe('published')
  })

  it('passes a notice with a good image, ordered headings and a descriptive link', async () => {
    const img = await goodImage()
    const n = await approvedNotice({
      heroImage: img.id,
      body: body(
        heading('h2'),
        paragraphWithLink('Read the fee schedule'),
        heading('h3'),
        heading('h2'),
      ),
    })
    expect(await refusal(() => publish(n.id))).toBeNull()
    expect(await published(n.id)).toBe('published')
  })
})
