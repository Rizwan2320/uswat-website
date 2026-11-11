import { postType } from './postTypes'

/**
 * Notices may have no expiry. Without one they leave current lists after 90 days unless pinned
 * (LIF-02): public lists apply `currentWhere(now, NOTICE_LISTING)` from governance/lifecycle.ts.
 */
export const Notices = postType({ slug: 'notices', singular: 'Notice', plural: 'Notices' })

export const NOTICE_LISTING = { ageOutDays: 90, dateField: 'publishedAt' } as const
