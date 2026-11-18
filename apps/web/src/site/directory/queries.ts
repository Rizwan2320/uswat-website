import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import type { Doc } from '../organisation/shape'

import { DIRECTORY_REVALIDATE_SECONDS, toContactEntry, type ContactEntry } from './shape'

/**
 * Published directory entries. No user is passed, so the collection's own rule applies (published only).
 * Cached 300 s under `list:contact-directory`; the collection has no revalidation hook yet.
 */
async function entriesUncached(): Promise<ContactEntry[]> {
  const payload = await getPayload({ config: configPromise })
  const res = await payload.find({
    collection: 'contact-directory',
    draft: false,
    overrideAccess: false,
    depth: 0,
    limit: 1000,
    pagination: false,
    sort: 'name',
  })
  return (res.docs as unknown as Doc[]).flatMap((d) => toContactEntry(d) ?? [])
}

export const listContacts = () =>
  unstable_cache(entriesUncached, ['directory', 'entries'], {
    revalidate: DIRECTORY_REVALIDATE_SECONDS,
    tags: ['list:contact-directory'],
  })()
