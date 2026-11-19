// @vitest-environment node
/**
 * Contact directory reads on a real database (brief p5-directory). Needs a local PostgreSQL.
 * Entries are named with the run id and the checks look only at those.
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn(), unstable_cache: (fn: unknown) => fn }))

import { applyContactSeeds, contacts } from '../../../../scripts/import/seeds/contacts'
import type { Cms } from '../../../../scripts/import/writer'
import { listContacts } from '../../src/site/directory/queries'
import { as, getTestPayload, makeUser, uniq } from '../helpers/governance'

let payload: Payload
let admin: Awaited<ReturnType<typeof makeUser>>
const tag = uniq('dir')

async function make(data: Record<string, unknown>, publish: boolean) {
  const rec = (await payload.create({
    collection: 'contact-directory',
    draft: true,
    data: { ...data, governance: { ownerOffice: 'Registrar', source: `https://${tag}.invalid/x` } } as never,
    ...as(admin),
  })) as unknown as { id: number }
  if (!publish) return
  const step = (d: Record<string, unknown>) => payload.update({ collection: 'contact-directory', id: rec.id, draft: true, data: d as never, ...as(admin) })
  await step({ governance: { status: 'in_review' } })
  await step({ governance: { status: 'approved', verificationStatus: 'verified', reviewDueAt: '2027-12-31T00:00:00.000Z' } })
  await payload.update({ collection: 'contact-directory', id: rec.id, data: { _status: 'published' } as never, ...as(admin) })
}

beforeAll(async () => {
  payload = await getTestPayload()
  admin = await makeUser(payload, 'platformAdmin', ['Registrar'])
  await make({ section: `${tag} Admin`, name: `${tag} live`, hours: '9 to 5', phones: [{ number: '+92 946 123456' }], email: `a@${tag}.invalid` }, true)
  await make({ section: `${tag} Admin`, name: `${tag} draft` }, false)
})

describe('contact directory', () => {
  it('serves a published entry with its phones and email, and never a draft', async () => {
    const mine = (await listContacts()).filter((e) => e.section.startsWith(tag))
    expect(mine.map((e) => e.name)).toEqual([`${tag} live`])
    expect(mine[0]).toMatchObject({ hours: '9 to 5', phones: [{ text: '+92 946 123456', href: 'tel:+9294612345' + '6' }], email: `a@${tag}.invalid`, sample: false })
  })
  it('seeds the Sample rows once: a second run writes nothing, and the rows read back as Sample', async () => {
    const actor = { user: { ...(admin as unknown as Record<string, unknown>), collection: 'users' } }
    await applyContactSeeds(payload as unknown as Cms, actor)
    const second = await applyContactSeeds(payload as unknown as Cms, actor)
    expect(second).toEqual({ created: 0, published: 0, inReview: 0, drafts: 0, unchanged: contacts.length })
    const sample = (await listContacts()).filter((e) => e.sample && e.name.startsWith('Sample'))
    expect(sample.length).toBeGreaterThanOrEqual(contacts.length)
    expect(sample.every((e) => e.phones.every((p) => p.href === null) && e.emailHref === null)).toBe(true)
  })
})
