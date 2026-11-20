/**
 * Sample rows for the contact directory (brief p5-directory). Invented: names start with "Sample", numbers are
 * fake, addresses are on sample.invalid. These rows have no slug, so they are found by source and seeded here,
 * apart from applySeeds. A row that is already published is never touched.
 */
import type { Cms } from '../writer'

import { SAMPLE_HOST, SAMPLE_OWNER_OFFICE, sampleSource } from './data'
import type { SeedActor } from './apply'
import { emptyResult, loadBySource, seedRecord, type FlowResult } from './flow'

export type ContactSeed = { key: string; section: string; name: string; hours?: string; phones: string[]; email?: string }

export const contacts: ContactSeed[] = [
  { key: 'sample-contact-01', section: 'Sample Administration', name: 'Sample Registrar Office', hours: 'Sample hours, Monday to Friday', phones: ['000-0000001'], email: `registrar@${SAMPLE_HOST}` },
  { key: 'sample-contact-02', section: 'Sample Administration', name: 'Sample Admissions Desk', hours: 'Sample hours, Monday to Friday', phones: ['000-0000002', '000-0000003'] },
  { key: 'sample-contact-03', section: 'Sample Administration', name: 'Sample Examinations Cell', phones: [], email: `exams@${SAMPLE_HOST}` },
  { key: 'sample-contact-04', section: 'Sample Departments', name: 'Sample Department of Physics', hours: 'Sample hours', phones: ['000-0000004'], email: `physics@${SAMPLE_HOST}` },
  { key: 'sample-contact-05', section: 'Sample Departments', name: 'Sample Department of English', phones: ['000-0000005'] },
  { key: 'sample-contact-06', section: 'Sample Services', name: 'Sample Library', hours: 'Sample hours, Monday to Saturday', phones: [], email: `library.with.a.very.long.sample.address.to.test.wrapping@${SAMPLE_HOST}` },
]

export async function applyContactSeeds(cms: Cms, actor: SeedActor): Promise<FlowResult> {
  const out = emptyResult()
  const existing = await loadBySource(cms, 'contact-directory')
  for (const c of contacts) {
    const source = sampleSource('contact-directory', c.key)
    await seedRecord(
      cms,
      actor,
      existing,
      {
        collection: 'contact-directory',
        source,
        state: 'published',
        data: {
          section: c.section,
          name: c.name,
          ...(c.hours ? { hours: c.hours } : {}),
          phones: c.phones.map((number) => ({ number })),
          ...(c.email ? { email: c.email } : {}),
          governance: { ownerOffice: SAMPLE_OWNER_OFFICE, source },
        },
      },
      out,
    )
  }
  return out
}
