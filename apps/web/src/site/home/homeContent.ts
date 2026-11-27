import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { HOME_TAG } from '../../globals/HomeContent/hooks'

import type { HomeDoc } from './homeMap'

/**
 * Reads the published `home-content` global for the home page (slider photographs and statistics bar).
 * Read without a user and without drafts, so only the published version can ever reach a visitor; the
 * global's own access rule enforces the same. The cache tag is the contract with the admin: every save
 * and publish refreshes `global_home-content` (globals/HomeContent/hooks.ts). Any failure (no database at
 * build time, an empty global) returns null and the caller falls back to the sourced files.
 */
async function readUncached(): Promise<HomeDoc | null> {
  try {
    const payload = await getPayload({ config: configPromise })
    const doc = await payload.findGlobal({ slug: 'home-content', draft: false, overrideAccess: false, depth: 1 })
    return doc as unknown as HomeDoc
  } catch {
    return null
  }
}

export const readHomeContent = (): Promise<HomeDoc | null> =>
  unstable_cache(readUncached, ['home', 'content'], { revalidate: 300, tags: [HOME_TAG] })()
