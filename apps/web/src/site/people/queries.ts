import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { previewReadOptions } from '@/governance/preview'

import { byName, type Doc } from '../organisation/shape'

import { PEOPLE_REVALIDATE_SECONDS, toPersonCard, toPersonProfile, type PersonCard, type PersonProfile } from './shape'

/**
 * Public reads for the people pages. No user is passed, so the People collection's own rules apply: published records only,
 * and an email or photo whose visibility is not Public is not returned at all. The list is cached 300 s under `list:people`
 * (the tag the department pages already use).
 */
async function listUncached(): Promise<PersonCard[]> {
  const payload = await getPayload({ config: configPromise })
  const res = await payload.find({
    collection: 'people',
    draft: false,
    overrideAccess: false,
    depth: 1,
    limit: 2000,
    pagination: false,
    sort: 'name',
    where: { facultyStatus: { equals: 'current' } },
  })
  return (res.docs as unknown as Doc[]).flatMap((d) => toPersonCard(d) ?? []).sort(byName)
}
/** Current people with a published record. Former and emeritus people are not in the directory (their page stays alive). */
export const listPeople = () =>
  unstable_cache(listUncached, ['people', 'list'], { revalidate: PEOPLE_REVALIDATE_SECONDS, tags: ['list:people'] })()

type PreviewArgs = { draftModeOn: boolean; headers: Headers }

/** One person by slug. Draft mode is only a cookie: who may see a draft comes from the login on this request. */
export async function getPerson(slug: string, args: PreviewArgs): Promise<PersonProfile | null> {
  const payload = await getPayload({ config: configPromise })
  const where = { slug: { equals: slug } }
  const read = await previewReadOptions(payload, args.draftModeOn, args.headers)
  if (read.draft) {
    const draft = await payload.find({ collection: 'people', limit: 1, pagination: false, where, depth: 1, ...read })
    const hit = draft.docs[0] ? toPersonProfile(draft.docs[0] as unknown as Doc) : null
    if (hit) return hit
  }
  const live = await payload.find({ collection: 'people', draft: false, overrideAccess: false, limit: 1, pagination: false, where, depth: 1 })
  return live.docs[0] ? toPersonProfile(live.docs[0] as unknown as Doc) : null
}
