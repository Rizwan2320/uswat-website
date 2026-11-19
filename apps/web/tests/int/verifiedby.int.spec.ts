// @vitest-environment node
/**
 * Slice 3s: the record itself says which reviewer marked it Verified. The value comes from the
 * signed-in reviewer, never from the request.
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import type { User } from '../../src/payload-types'
import { as, getTestPayload, makeUser, pageData } from '../helpers/governance'

let payload: Payload
let editor: User, approver: User, admin: User

type Gov = { verifiedBy?: number | null; verifiedAt?: string | null; verificationStatus?: string }
const gov = () => ({ ownerOffice: 'Registrar', source: 'https://example.test/source' })
const draftGov = async (id: number): Promise<Gov> =>
  (
    (await payload.findByID({
      collection: 'pages',
      id,
      draft: true,
      depth: 0,
      overrideAccess: true,
    })) as { governance?: Gov }
  ).governance ?? {}
const move = (user: User, id: number, governance: Record<string, unknown>, extra = {}) =>
  payload.update({
    collection: 'pages',
    id,
    draft: true,
    data: { governance, ...extra } as never,
    ...as(user),
  })

async function newPage() {
  const p = (await payload.create({
    collection: 'pages',
    draft: true,
    data: pageData(gov()),
    ...as(editor),
  })) as { id: number }
  await move(editor, p.id, { status: 'in_review' })
  return p.id
}

beforeAll(async () => {
  payload = await getTestPayload()
  editor = await makeUser(payload, 'editor', ['Registrar'])
  approver = await makeUser(payload, 'approver', ['Registrar'])
  admin = await makeUser(payload, 'platformAdmin')
})

describe('governance.verifiedBy', () => {
  it('is empty until a reviewer verifies, then names that reviewer', async () => {
    const id = await newPage()
    expect((await draftGov(id)).verifiedBy ?? null).toBeNull()
    await move(approver, id, { status: 'approved', verificationStatus: 'verified' })
    const g = await draftGov(id)
    expect(g.verificationStatus).toBe('verified')
    expect(g.verifiedBy).toBe(approver.id)
    expect(g.verifiedAt).toBeTruthy()
  })

  it('names an administrator when an administrator verifies', async () => {
    const id = await newPage()
    await move(admin, id, { status: 'approved', verificationStatus: 'verified' })
    expect((await draftGov(id)).verifiedBy).toBe(admin.id)
  })

  it('keeps the same reviewer while it stays Verified, even through other saves', async () => {
    const id = await newPage()
    await move(approver, id, { status: 'approved', verificationStatus: 'verified' })
    await move(admin, id, { riskClass: 'standard', source: 'https://example.test/other' })
    expect((await draftGov(id)).verifiedBy).toBe(approver.id)
  })

  it('is cleared when an editor changes the content and verification is reset', async () => {
    const id = await newPage()
    await move(approver, id, { status: 'approved', verificationStatus: 'verified' })
    await payload.update({
      collection: 'pages',
      id,
      draft: true,
      data: { title: 'Changed by an editor' } as never,
      ...as(editor),
    })
    const g = await draftGov(id)
    expect(g.verificationStatus).toBe('unverified')
    expect(g.verifiedBy ?? null).toBeNull()
  })

  it('cannot be set from a request: a value sent by an editor is ignored', async () => {
    const id = await newPage()
    await move(editor, id, { verifiedBy: approver.id })
    expect((await draftGov(id)).verifiedBy ?? null).toBeNull()
    // Nor can it be added to a record that is not Verified by a reviewer sending it along.
    await move(approver, id, { verifiedBy: admin.id })
    expect((await draftGov(id)).verifiedBy ?? null).toBeNull()
  })
})
