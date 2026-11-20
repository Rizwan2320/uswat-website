/** Loads the three record sets for one account. The account id comes from the session; every store query carries it. */
import type pg from 'pg'

import { createPgCourseStore } from '../courses/pgStore'
import { createSampleProfileStore } from '../profile/sampleStore'
import { createPgPublicationStore } from '../publications/pgStore'
import type { CvInput } from './build'

export async function loadCvInput(pool: pg.Pool, account: { id: string; email: string }): Promise<CvInput> {
  const [loaded, lists, courses] = await Promise.all([
    createSampleProfileStore(pool).load(account),
    createPgPublicationStore(pool).list(account.id),
    createPgCourseStore(pool).list(account.id),
  ])
  return { profile: loaded.profile, claimedWorks: lists.claimed, courses }
}

/** The clock, kept out of `buildCv` so that stays pure and testable. */
export const currentTime = (): number => Date.now()
