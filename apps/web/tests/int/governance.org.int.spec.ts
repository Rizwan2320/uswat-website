// @vitest-environment node
/**
 * Slice 3e: organisation collections go through the same workflow as every governed type, and
 * personal details on People obey their own visibility on every public read (Addendum C FP-06).
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import type { User } from '../../src/payload-types'
import { as, getTestPayload, makeUser, refusal, uniq } from '../helpers/governance'

type Slug = 'faculties' | 'departments' | 'programmes' | 'offices' | 'campuses' | 'people'
const SLUGS: Slug[] = ['faculties', 'departments', 'programmes', 'offices', 'campuses', 'people']

let payload: Payload
let editor: User, approver: User

const gov = () => ({ ownerOffice: 'Registrar', source: 'https://example.test/source' })
const create = (slug: Slug, user: User, extra: Record<string, unknown> = {}) =>
  payload.create({
    collection: slug,
    draft: true,
    data: { name: uniq(slug), ...extra, governance: gov() } as never,
    ...as(user),
  }) as Promise<{ id: number; governance?: Record<string, unknown> }>
const step = (slug: Slug, user: User, id: number, governance: Record<string, unknown>) =>
  payload.update({
    collection: slug,
    id,
    draft: true,
    data: { governance } as never,
    ...as(user),
  })
async function live(slug: Slug, extra: Record<string, unknown> = {}) {
  const p = await create(slug, editor, extra)
  await step(slug, editor, p.id, { status: 'in_review' })
  await step(slug, approver, p.id, { status: 'approved', verificationStatus: 'verified' })
  await payload.update({
    collection: slug,
    id: p.id,
    data: { _status: 'published', governance: {} } as never,
    ...as(approver),
  })
  return p
}
/** A read the way the public API does it: no user, access enforced. */
const anon = { overrideAccess: false, user: null } as const

describe('organisation collections', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    ;[editor, approver] = await Promise.all([
      makeUser(payload, 'editor', ['Registrar']),
      makeUser(payload, 'approver', ['Registrar']),
    ])
  })

  describe.each(SLUGS)('%s', (slug) => {
    it('walks the workflow, refuses unverified publish, and is audited', async () => {
      const p = await create(slug, editor)
      expect(p.governance).toMatchObject({ status: 'draft', verificationStatus: 'unverified' })
      await step(slug, editor, p.id, { status: 'in_review' })
      expect(
        await refusal(() => step(slug, editor, p.id, { verificationStatus: 'verified' })),
      ).toBe('VERIFY_FORBIDDEN')
      await step(slug, approver, p.id, { status: 'approved' })
      expect(
        await refusal(() =>
          payload.update({
            collection: slug,
            id: p.id,
            data: { _status: 'published', governance: {} } as never,
            ...as(approver),
          }),
        ),
      ).not.toBeNull()
      await step(slug, approver, p.id, { verificationStatus: 'verified' })
      await payload.update({
        collection: slug,
        id: p.id,
        data: { _status: 'published', governance: {} } as never,
        ...as(approver),
      })
      const log = await payload.find({
        collection: 'audit-logs',
        where: { and: [{ collection: { equals: slug } }, { recordId: { equals: String(p.id) } }] },
        overrideAccess: true,
      })
      expect(log.totalDocs).toBeGreaterThanOrEqual(3)
    })

    it('does not show an unpublished record to the public', async () => {
      const p = await create(slug, editor)
      const res = await payload.find({
        collection: slug,
        where: { id: { equals: p.id } },
        ...anon,
      })
      expect(res.totalDocs).toBe(0)
    })
  })

  it('relationships hold: programme > department > faculty group, person > department and office', async () => {
    const fg = await live('faculties')
    const dept = await live('departments', { facultyGroup: fg.id })
    const prog = await live('programmes', { department: dept.id })
    const office = await live('offices')
    const person = await live('people', { department: dept.id, office: office.id })

    const p = (await payload.findByID({
      collection: 'programmes',
      id: prog.id,
      depth: 2,
      ...anon,
    })) as { department?: { facultyGroup?: { id: number } } }
    expect(p.department?.facultyGroup?.id).toBe(fg.id)

    const who = (await payload.findByID({
      collection: 'people',
      id: person.id,
      depth: 1,
      ...anon,
    })) as { department?: { id: number }; office?: { id: number } }
    expect(who.department?.id).toBe(dept.id)
    expect(who.office?.id).toBe(office.id)
  })

  describe('people: personal details follow their visibility', () => {
    const EMAIL = 'someone@example.test'
    const person = (visibility: Record<string, string> = {}) =>
      live('people', { email: EMAIL, ...(Object.keys(visibility).length ? { visibility } : {}) })
    const readAnon = (id: number) =>
      payload.findByID({ collection: 'people', id, ...anon }) as Promise<{
        email?: string
        facultyStatus?: string
        visibility?: Record<string, string>
      }>

    it('defaults: status is current and every personal field is hidden', async () => {
      const p = await person()
      const row = (await payload.findByID({
        collection: 'people',
        id: p.id,
        overrideAccess: true,
      })) as { facultyStatus?: string; visibility?: Record<string, string> }
      expect(row.facultyStatus).toBe('current')
      expect(row.visibility).toMatchObject({ email: 'hidden', photo: 'hidden' })
    })

    it('P3e-b: a hidden email is not in an anonymous read, a public one is', async () => {
      const hidden = await person()
      const internal = await person({ email: 'internal' })
      const open = await person({ email: 'public' })
      expect((await readAnon(hidden.id)).email).toBeUndefined()
      expect((await readAnon(internal.id)).email).toBeUndefined()
      expect((await readAnon(open.id)).email).toBe(EMAIL)
    })

    it('the same rule holds in lists and in populated relationships', async () => {
      const hidden = await person()
      const dept = await live('departments', { head: hidden.id })

      const list = await payload.find({
        collection: 'people',
        where: { id: { equals: hidden.id } },
        ...anon,
      })
      expect(list.docs[0]).toBeDefined()
      expect((list.docs[0] as { email?: string }).email).toBeUndefined()

      const d = (await payload.findByID({
        collection: 'departments',
        id: dept.id,
        depth: 2,
        ...anon,
      })) as { head?: { email?: string; name?: string } }
      expect(d.head?.name).toBeTruthy()
      expect(d.head?.email).toBeUndefined()
    })

    it('a read that selects only the email still hides it (fails closed)', async () => {
      const hidden = await person()
      const res = (await payload.find({
        collection: 'people',
        where: { id: { equals: hidden.id } },
        select: { email: true },
        ...anon,
      })) as { docs: { email?: string }[] }
      expect(res.docs[0]?.email).toBeUndefined()
    })

    it('P3e-c: an anonymous query cannot probe a hidden address', async () => {
      await person()
      await expect(
        payload.find({ collection: 'people', where: { email: { equals: EMAIL } }, ...anon }),
      ).rejects.toThrow(/cannot be queried/)
    })

    it('signed-in staff always see the value, whatever its visibility', async () => {
      const hidden = await person()
      const row = (await payload.findByID({
        collection: 'people',
        id: hidden.id,
        ...as(editor),
      })) as { email?: string }
      expect(row.email).toBe(EMAIL)
    })
  })
})
