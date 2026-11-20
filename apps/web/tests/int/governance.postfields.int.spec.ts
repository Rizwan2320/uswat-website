// @vitest-environment node
/**
 * Slice 3x: News (`posts`) has a summary, attached files, an old address and a department link
 * (docs/briefs/p3x-post-fields.md).
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import type { User } from '../../src/payload-types'
import { as, can, getTestPayload, makeUser, refusal, system, uniq } from '../helpers/governance'

let payload: Payload
let admin: User, editor: User

const gov = () => ({ ownerOffice: 'Registrar', source: 'https://example.test/source' })
const body = {
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'Sample text.',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            version: 1,
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    ],
    direction: null,
    format: '',
    indent: 0,
    version: 1,
  },
}

const makeDepartment = () =>
  payload.create({
    collection: 'departments',
    draft: true,
    data: { name: uniq('dept'), governance: gov() } as never,
    ...system,
  }) as Promise<{ id: number }>

const makePost = (extra: Record<string, unknown> = {}, user: User = editor) =>
  payload.create({
    collection: 'posts',
    draft: true,
    data: { title: uniq('news'), content: body, governance: gov(), ...extra } as never,
    ...as(user),
  }) as Promise<{
    id: number
    excerpt?: string | null
    legacyUrl?: string | null
    department?: number | { id: number } | null
    attachments?: { label: string; url: string }[] | null
    governance?: Record<string, unknown>
  }>

/** Draft > in review (editor) > approved and verified (admin): the route the workflow requires. */
async function approve(id: number) {
  await payload.update({
    collection: 'posts',
    id,
    draft: true,
    data: { governance: { status: 'in_review' } } as never,
    ...as(editor),
  })
  return payload.update({
    collection: 'posts',
    id,
    draft: true,
    data: {
      governance: {
        status: 'approved',
        verificationStatus: 'verified',
        reviewDueAt: '2027-06-30T00:00:00.000Z',
      },
    } as never,
    ...as(admin),
  }) as Promise<{ governance?: Record<string, unknown> }>
}

const deptId = (d: unknown) => (typeof d === 'object' && d ? (d as { id: number }).id : d)

beforeAll(async () => {
  payload = await getTestPayload()
  admin = await makeUser(payload, 'platformAdmin')
  editor = await makeUser(payload, 'editor', ['registrar'])
})

describe('News fields', () => {
  it('stores and returns the summary, files, old address and department', async () => {
    const dept = await makeDepartment()
    const post = await makePost({
      excerpt: 'A short summary.',
      legacyUrl: 'https://www.uswat.edu.pk/news/old-1',
      department: dept.id,
      attachments: [{ label: 'Schedule (PDF)', url: 'https://example.test/schedule.pdf' }],
    })
    const row = (await payload.findByID({
      collection: 'posts',
      id: post.id,
      depth: 0,
      draft: true,
      ...system,
    })) as typeof post
    expect(row.excerpt).toBe('A short summary.')
    expect(row.legacyUrl).toBe('https://www.uswat.edu.pk/news/old-1')
    expect(deptId(row.department)).toBe(dept.id)
    expect(row.attachments).toMatchObject([
      { label: 'Schedule (PDF)', url: 'https://example.test/schedule.pdf' },
    ])
  })

  it('keeps the new fields in saved versions', async () => {
    const dept = await makeDepartment()
    const post = await makePost({ excerpt: 'Kept in versions.', department: dept.id })
    const versions = await payload.findVersions({
      collection: 'posts',
      where: { parent: { equals: post.id } },
      depth: 0,
      ...system,
    })
    const v = versions.docs[0] as unknown as {
      version: { excerpt?: string; department?: number | { id: number } }
    }
    expect(v.version.excerpt).toBe('Kept in versions.')
    expect(deptId(v.version.department)).toBe(dept.id)
  })

  const publish = (id: number) =>
    payload.update({
      collection: 'posts',
      id,
      data: { _status: 'published', governance: { status: 'published' } } as never,
      ...as(admin),
    })

  it('refuses an unsafe attached address when the post is published', async () => {
    const bad = await makePost({ attachments: [{ label: 'Bad', url: 'javascript:alert(1)' }] })
    expect((await approve(bad.id)).governance).toMatchObject({ status: 'approved' })
    expect(await can(() => publish(bad.id))).toBe(false)

    // Control: the same steps with a safe address publish, so the refusal is about the address.
    const ok = await makePost({
      attachments: [{ label: 'Good', url: 'https://example.test/g.pdf' }],
    })
    expect((await approve(ok.id)).governance).toMatchObject({ status: 'approved' })
    expect(await can(() => publish(ok.id))).toBe(true)
  })

  const edit = async (id: number, data: Record<string, unknown>) =>
    (await payload.update({
      collection: 'posts',
      id,
      draft: true,
      data: data as never,
      ...as(editor),
    })) as { governance?: Record<string, unknown> }

  it('counts a changed summary as a content edit: approval is withdrawn', async () => {
    const post = await makePost({ excerpt: 'First.' })
    expect((await approve(post.id)).governance).toMatchObject({
      status: 'approved',
      verificationStatus: 'verified',
    })
    expect((await edit(post.id, { excerpt: 'Second.' })).governance).toMatchObject({
      status: 'draft',
      verificationStatus: 'unverified',
    })
  })

  it('counts changed files and a changed department as content edits too', async () => {
    const [a, b] = [await makeDepartment(), await makeDepartment()]
    const post = await makePost({ department: a.id })
    await approve(post.id)
    expect((await edit(post.id, { department: b.id })).governance).toMatchObject({
      status: 'draft',
    })
    await approve(post.id)
    expect(
      (await edit(post.id, { attachments: [{ label: 'New', url: 'https://example.test/n.pdf' }] }))
        .governance,
    ).toMatchObject({ status: 'draft' })
  })

  it('does not withdraw approval when nothing changed (control for the two tests above)', async () => {
    const post = await makePost({ excerpt: 'Same.' })
    await approve(post.id)
    expect((await edit(post.id, { excerpt: 'Same.' })).governance).toMatchObject({
      status: 'approved',
    })
  })
})

describe('a department that news points at', () => {
  it('cannot be deleted while a post uses it, and the message counts the posts', async () => {
    const dept = await makeDepartment()
    const post = await makePost({ department: dept.id })
    let message = ''
    const code = await refusal(async () => {
      try {
        await payload.delete({ collection: 'departments', id: dept.id, ...as(admin) })
      } catch (e) {
        message = (e as Error).message
        throw e
      }
    })
    expect(code).toBe('IN_USE')
    expect(message).toMatch(/1 (Post|News)/)
    await payload.delete({ collection: 'posts', id: post.id, ...system })
    await payload.delete({ collection: 'departments', id: dept.id, ...as(admin) })
  })
})
