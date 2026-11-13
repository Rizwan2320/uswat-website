/**
 * The editor dashboard's queues (plan v2 CMS-09): my drafts, review queue, expiring soon, stale,
 * and images that need alt text. Pure query definitions, so they are unit-tested; the data loader
 * (dashboardData.ts) runs them with the signed-in user's own access.
 */

import type { Where } from 'payload'

import { reviewQueueWhere } from './lifecycle'
import type { Role } from './roles'

export const QUEUE_KEYS = ['myDrafts', 'review', 'expiring', 'stale', 'needsAlt'] as const
export type QueueKey = (typeof QUEUE_KEYS)[number]

/** PROPOSED: "expiring soon" means within 14 days. One constant. */
export const EXPIRING_SOON_DAYS = 14

const all = (...w: Where[]): Where => ({ and: w })
const any = (...w: Where[]): Where => ({ or: w })

const REVIEWERS: Role[] = ['platformAdmin', 'siteManager', 'approver']
const WRITERS: Role[] = [...REVIEWERS, 'editor', 'contributor']

export interface QueueSpec {
  key: QueueKey
  title: string
  /** One plain sentence under the title. */
  help: string
  /** Roles shown this queue. */
  roles: Role[]
  /** Governed records, or the media library. */
  target: 'governed' | 'media'
  /** True: read the latest saved draft, not the live row. */
  draft: boolean
  where: (ctx: { userId: string | number; now: Date }) => Where
}

export const QUEUES: QueueSpec[] = [
  {
    key: 'myDrafts',
    title: 'My drafts',
    help: 'Things you started and have not sent for review yet.',
    roles: WRITERS,
    target: 'governed',
    draft: true,
    where: ({ userId }) =>
      all(
        { 'governance.createdBy': { equals: userId } },
        { 'governance.status': { equals: 'draft' } },
      ),
  },
  {
    key: 'review',
    title: 'Waiting for review',
    help: 'Submitted by an editor, or brought in by the importer, or past its review date.',
    roles: REVIEWERS,
    target: 'governed',
    draft: true,
    where: () => reviewQueueWhere(),
  },
  {
    key: 'expiring',
    title: 'Expiring soon',
    help: `Live or approved items that end within ${EXPIRING_SOON_DAYS} days.`,
    roles: WRITERS,
    target: 'governed',
    draft: true,
    where: ({ now }) =>
      all(
        { 'governance.status': { in: ['approved', 'published'] } },
        { 'governance.expireAt': { greater_than: now.toISOString() } },
        {
          'governance.expireAt': {
            less_than_equal: new Date(
              now.getTime() + EXPIRING_SOON_DAYS * 86_400_000,
            ).toISOString(),
          },
        },
      ),
  },
  {
    key: 'stale',
    title: 'Needs a fresh check',
    help: 'Live pages whose review date has passed. Check the facts and mark them verified again.',
    roles: REVIEWERS,
    target: 'governed',
    draft: false,
    where: ({ now }) =>
      all(
        { 'governance.status': { equals: 'published' } },
        any(
          { 'governance.verificationStatus': { equals: 'stale' } },
          { 'governance.reviewDueAt': { less_than_equal: now.toISOString() } },
        ),
      ),
  },
  {
    key: 'needsAlt',
    title: 'Images without alt text',
    help: 'Add a short description. An image without one cannot appear on a published page.',
    roles: REVIEWERS,
    target: 'media',
    draft: false,
    where: () => any({ alt: { exists: false } }, { alt: { equals: '' } }),
  },
]

export const queuesFor = (role: Role): QueueSpec[] => QUEUES.filter((q) => q.roles.includes(role))
