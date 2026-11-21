// @vitest-environment node
/**
 * Slice 3s: a record that goes live with no "Check again by" gets a default by risk, so the Stale
 * state can fire for ordinary items. A person's own date always wins.
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import type { User } from '../../src/payload-types'
import { as, getTestPayload, makeUser, pageData, refusal } from '../helpers/governance'

let payload: Payload
let editor: User, approver: User, author: User

const DAY = 24 * 60 * 60 * 1000
const gov = (extra: Record<string, unknown> = {}) => ({
  ownerOffice: 'Registrar',
  source: 'https://example.test/source',
  ...extra,
})
const move = (user: User, id: number, governance: Record<string, unknown>) =>
  payload.update({ collection: 'pages', id, draft: true, data: { governance }, ...as(user) })

async function readyToPublish(governance: Record<string, unknown>, approverOnly = false) {
  const p = (await payload.create({
    collection: 'pages',
    draft: true,
    data: pageData(gov(governance)),
    ...as(approverOnly ? author : editor),
  })) as { id: number }
  if (!approverOnly) await move(editor, p.id, { status: 'in_review' })
  // Note: no reviewDueAt here.
  await move(approver, p.id, { status: 'approved', verificationStatus: 'verified' })
  return p.id
}
const publish = (id: number) =>
  payload.update({
    collection: 'pages',
    id,
    data: { _status: 'published', governance: {} },
    ...as(approver),
  })
const liveDue = async (id: number) =>
  (
    (await payload.findByID({ collection: 'pages', id, overrideAccess: true, depth: 0 })) as {
      governance?: { reviewDueAt?: string | null }
    }
  ).governance?.reviewDueAt

const daysFromNow = (iso: string | null | undefined) =>
  Math.round((Date.parse(String(iso)) - Date.now()) / DAY)

beforeAll(async () => {
  payload = await getTestPayload()
  editor = await makeUser(payload, 'editor', ['Registrar'])
  approver = await makeUser(payload, 'approver', ['Registrar'])
  // Nobody approves their own work: the approver-only cases are written by a second person.
  author = await makeUser(payload, 'approver', ['Registrar'])
})

describe('default "Check again by" when going live without one', () => {
  it('standard risk gets about 180 days', async () => {
    const id = await readyToPublish({})
    await publish(id)
    expect(daysFromNow(await liveDue(id))).toBeGreaterThanOrEqual(179)
    expect(daysFromNow(await liveDue(id))).toBeLessThanOrEqual(181)
  })

  it('low risk gets about 365 days', async () => {
    const id = await readyToPublish({ riskClass: 'low' }, true)
    await publish(id)
    expect(daysFromNow(await liveDue(id))).toBeGreaterThanOrEqual(364)
    expect(daysFromNow(await liveDue(id))).toBeLessThanOrEqual(366)
  })

  it('a date a person set is kept as it was', async () => {
    const id = await readyToPublish({ reviewDueAt: '2027-03-01T00:00:00.000Z' })
    await publish(id)
    expect(new Date(String(await liveDue(id))).toISOString()).toBe('2027-03-01T00:00:00.000Z')
  })

  it('High impact is not defaulted: a person must still choose the date', async () => {
    const id = await readyToPublish({ riskClass: 'high_impact' }, true)
    expect(await refusal(() => publish(id))).toBe('REVIEW_DATE_REQUIRED')
  })
})
