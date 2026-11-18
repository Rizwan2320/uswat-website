/**
 * Sample rows for the contact directory (brief p5-directory). Invented: names start with "Sample", numbers are
 * zeros, addresses are on sample.invalid. These rows have no slug, so they are found by source and seeded here,
 * apart from applySeeds. A row that is already published is never touched.
 */
import type { Cms } from '../writer'

import { SAMPLE_HOST, SAMPLE_OWNER_OFFICE, sampleSource } from './data'
import type { SeedActor, SeedResult } from './apply'

export type ContactSeed = { key: string; section: string; name: string; hours?: string; phones: string[]; email?: string }

export const contacts: ContactSeed[] = [
  { key: 'sample-contact-01', section: 'Sample Administration', name: 'Sample Registrar Office', hours: 'Sample hours, Monday to Friday', phones: ['+00 000 0000001'], email: `registrar@${SAMPLE_HOST}` },
  { key: 'sample-contact-02', section: 'Sample Administration', name: 'Sample Admissions Desk', hours: 'Sample hours, Monday to Friday', phones: ['+00 000 0000002', '+00 000 0000003'] },
  { key: 'sample-contact-03', section: 'Sample Administration', name: 'Sample Examinations Cell', phones: [], email: `exams@${SAMPLE_HOST}` },
  { key: 'sample-contact-04', section: 'Sample Departments', name: 'Sample Department of Physics', hours: 'Sample hours', phones: ['+00 000 0000004'], email: `physics@${SAMPLE_HOST}` },
  { key: 'sample-contact-05', section: 'Sample Departments', name: 'Sample Department of English', phones: ['+00 000 0000005'] },
  { key: 'sample-contact-06', section: 'Sample Services', name: 'Sample Library', hours: 'Sample hours, Monday to Saturday', phones: [], email: `library.with.a.very.long.sample.address.to.test.wrapping@${SAMPLE_HOST}` },
]

const CONTEXT = { disableRevalidate: true }
const REVIEW_DUE = '2027-12-31T00:00:00.000Z'
type Args = Record<string, unknown>

export async function applyContactSeeds(cms: Cms, actor: SeedActor): Promise<Pick<SeedResult, 'created' | 'published' | 'unchanged'>> {
  const as = (): Args => ({ user: actor.user, overrideAccess: false, context: CONTEXT })
  const out = { created: 0, published: 0, unchanged: 0 }
  const found = await cms.find({
    collection: 'contact-directory',
    draft: true,
    depth: 0,
    limit: 500,
    overrideAccess: true,
    where: { 'governance.source': { like: `https://${SAMPLE_HOST}/seed/contact-directory/` } },
  })
  const existing = new Map<string, { id: number | string; published: boolean }>()
  for (const d of found.docs) {
    const src = String((d.governance as { source?: string } | undefined)?.source ?? '')
    existing.set(src, { id: d.id as number | string, published: (d as { _status?: string })._status === 'published' })
  }
  for (const c of contacts) {
    const source = sampleSource('contact-directory', c.key)
    let rec = existing.get(source)
    if (rec?.published) {
      out.unchanged++
      continue
    }
    if (!rec) {
      const doc = await cms.create({
        collection: 'contact-directory',
        draft: true,
        data: {
          section: c.section,
          name: c.name,
          ...(c.hours ? { hours: c.hours } : {}),
          phones: c.phones.map((number) => ({ number })),
          ...(c.email ? { email: c.email } : {}),
          governance: { ownerOffice: SAMPLE_OWNER_OFFICE, source },
        },
        ...as(),
      })
      rec = { id: doc.id as number | string, published: false }
      out.created++
    }
    const step = (data: Args) => cms.update({ collection: 'contact-directory', id: rec!.id, draft: true, data, ...as() })
    await step({ governance: { status: 'in_review' } })
    await step({ governance: { status: 'approved', verificationStatus: 'verified', reviewDueAt: REVIEW_DUE } })
    await cms.update({ collection: 'contact-directory', id: rec.id, data: { _status: 'published' }, ...as() })
    out.published++
  }
  return out
}
