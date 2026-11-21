// @vitest-environment node
/**
 * Slice 3aa: the reviewer's note that goes with Send back (governance.reviewNote).
 * Only a reviewer's save can write it; it lives only while the record is a draft that was sent back.
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import type { User } from '../../src/payload-types'
import { as, getTestPayload, makeUser, uniq } from '../helpers/governance'

let payload: Payload
let editor: User, approver: User, otherApprover: User

const note = (r: unknown) =>
  (r as { governance?: { reviewNote?: string | null } }).governance?.reviewNote ?? null
const status = (r: unknown) => (r as { governance?: { status?: string } }).governance?.status

const make = () =>
  payload.create({
    collection: 'notices',
    draft: true,
    data: {
      title: uniq('note'),
      governance: { ownerOffice: 'Registrar', source: 'https://example.test/source' },
    } as never,
    ...as(editor),
  }) as Promise<{ id: number }>
const step = (id: number, user: User, governance: Record<string, unknown>) =>
  payload.update({
    collection: 'notices',
    id,
    draft: true,
    data: { governance } as never,
    ...as(user),
  })

beforeAll(async () => {
  payload = await getTestPayload()
  ;[editor, approver, otherApprover] = await Promise.all([
    makeUser(payload, 'editor', ['Registrar']),
    makeUser(payload, 'approver', ['Registrar']),
    makeUser(payload, 'approver', ['Library']),
  ])
})

describe('the reviewer note', () => {
  it('an approver sends a draft back with a note, and the note is kept', async () => {
    const n = await make()
    await step(n.id, editor, { status: 'in_review' })
    const back = await step(n.id, approver, { status: 'draft', reviewNote: 'Add the fee year.' })
    expect(status(back)).toBe('draft')
    expect(note(back)).toBe('Add the fee year.')
  })

  it('an editor cannot write a note: it is dropped, so nobody can fake a reviewer message', async () => {
    const n = await make()
    const r = await step(n.id, editor, { reviewNote: 'Approved by the vice chancellor.' })
    expect(note(r)).toBeNull()
  })

  it('an approver of another office cannot send it back at all (control for the success above)', async () => {
    const n = await make()
    await step(n.id, editor, { status: 'in_review' })
    await expect(
      step(n.id, otherApprover, { status: 'draft', reviewNote: 'Not mine to review.' }),
    ).rejects.toBeTruthy()
  })

  it('moving to review, approved or published clears the note', async () => {
    const n = await make()
    await step(n.id, editor, { status: 'in_review' })
    await step(n.id, approver, { status: 'draft', reviewNote: 'Fix the heading.' })
    const again = await step(n.id, editor, { status: 'in_review' })
    expect(status(again)).toBe('in_review')
    expect(note(again)).toBeNull()

    // A note left on a draft does not survive an approval either.
    await step(n.id, approver, { status: 'draft', reviewNote: 'Second thought.' })
    await step(n.id, editor, { status: 'in_review' })
    const approved = await step(n.id, approver, {
      status: 'approved',
      verificationStatus: 'verified',
    })
    expect(note(approved)).toBeNull()
  })

  it('an editor editing a sent-back draft keeps seeing the note until they send it again', async () => {
    const n = await make()
    await step(n.id, editor, { status: 'in_review' })
    await step(n.id, approver, { status: 'draft', reviewNote: 'Shorten the summary.' })
    const edited = (await payload.update({
      collection: 'notices',
      id: n.id,
      draft: true,
      data: { title: uniq('retitled') } as never,
      ...as(editor),
    })) as unknown
    expect(note(edited)).toBe('Shorten the summary.')
  })
})
