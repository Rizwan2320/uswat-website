/**
 * The editor dashboard's queues (plan v2 CMS-09): my drafts, review queue, expiring soon, stale,
 * and images that need alt text. Pure query definitions, so they are unit-tested; the data loader
 * (dashboardData.ts) runs them with the signed-in user's own access.
 */

import type { Where } from 'payload'

import { scopeFilter } from './access'
import { reviewQueueWhere } from './lifecycle'
import { mayApproveOwn } from './policy'
import { isCoordinatorActor, type Actor, type Role } from './roles'

/** In the order a person should read them: what needs them first. */
export const QUEUE_KEYS = [
  'review',
  'toPublish',
  'sentBack',
  'myDrafts',
  'sentByMe',
  'stale',
  'expiring',
  'needsAlt',
] as const
export type QueueKey = (typeof QUEUE_KEYS)[number]

/** PROPOSED: "expiring soon" means within 14 days. One constant. */
export const EXPIRING_SOON_DAYS = 14

const all = (...w: Where[]): Where => ({ and: w })
const any = (...w: Where[]): Where => ({ or: w })

const REVIEWERS: Role[] = ['platformAdmin', 'siteManager', 'approver']
const WRITERS: Role[] = [...REVIEWERS, 'editor', 'contributor']
/** Editors and contributors also get the two lists that follow their own work through review (3aa). */
const AUTHORS: Role[] = ['editor', 'contributor']

/**
 * Limits a list of live items to what the person looks after (slice 3ai). Published rows are public,
 * so the read filter alone would show everyone every office's expiring and stale pages; a head or a
 * coordinator should see their own. Without an actor (a count for the operations panel) nothing is added.
 */
const inMyScope = (
  base: Where,
  actor: Actor | undefined,
  collection: string | undefined,
): Where => {
  if (!actor) return base
  const scope = scopeFilter(actor, '', collection)
  if (scope === true) return base
  return all(base, scope === false ? { id: { in: [-1] } } : scope)
}

const noNote = (): Where =>
  any({ 'governance.reviewNote': { exists: false } }, { 'governance.reviewNote': { equals: '' } })

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
  where: (ctx: {
    userId: string | number
    now: Date
    /** Who is asking and which collection, for the lists that differ by role (optional for counts). */
    actor?: Actor
    collection?: string
  }) => Where
  /** A narrower test than `roles` (a coordinator is an Editor with programmes). */
  visible?: (actor: Actor) => boolean
  /** Plainer words for a role whose job differs from the default (slice 3ai). */
  words?: (actor: Actor) => { title: string; help: string } | null
}

export const QUEUES: QueueSpec[] = [
  {
    key: 'review',
    title: 'Waiting for review',
    help: 'Submitted by an editor, or brought in by the importer, or past its review date.',
    roles: REVIEWERS,
    target: 'governed',
    draft: true,
    // Someone who cannot approve their own work is not asked to (slice 3ai): their own item waits
    // for another reviewer and is listed under "I sent for review" instead.
    where: ({ userId, actor, collection }) =>
      actor && collection && mayApproveOwn(actor, { collection, id: null })
        ? reviewQueueWhere()
        : all(reviewQueueWhere(), { 'governance.createdBy': { not_equals: userId } }),
    words: (actor) =>
      actor.kind === 'user' && actor.role === 'approver'
        ? {
            title: 'Waiting for your review',
            help: 'Sent to you by your coordinators and editors. Open one, then approve it or send it back with a reason.',
          }
        : null,
  },
  {
    key: 'toPublish',
    title: 'Approved, ready to publish',
    help: 'Approved and waiting for the Publish button.',
    roles: [...REVIEWERS, 'editor'],
    target: 'governed',
    draft: true,
    // A coordinator publishes only what their head approved and verified (slice 3aj).
    where: ({ actor }) =>
      actor && isCoordinatorActor(actor)
        ? all(
            { 'governance.status': { equals: 'approved' } },
            { 'governance.verificationStatus': { equals: 'verified' } },
          )
        : { 'governance.status': { equals: 'approved' } },
    visible: (actor) =>
      actor.kind === 'user' && (actor.role !== 'editor' || isCoordinatorActor(actor)),
    words: (actor) =>
      isCoordinatorActor(actor)
        ? {
            title: 'Ready for you to publish',
            help: 'Your head of department approved and verified these. Open one and press Publish.',
          }
        : null,
  },
  {
    key: 'sentBack',
    title: 'Sent back to me',
    help: 'Your approver sent these back with a reason. Open one, fix it and send it again.',
    roles: AUTHORS,
    target: 'governed',
    draft: true,
    where: ({ userId }) =>
      all(
        { 'governance.createdBy': { equals: userId } },
        { 'governance.status': { equals: 'draft' } },
        { 'governance.reviewNote': { exists: true } },
        { 'governance.reviewNote': { not_equals: '' } },
      ),
  },
  {
    key: 'myDrafts',
    title: 'My drafts',
    help: 'Things you started and have not sent for review yet. Items sent back to you are listed above.',
    roles: WRITERS,
    target: 'governed',
    draft: true,
    where: ({ userId }) =>
      all(
        { 'governance.createdBy': { equals: userId } },
        { 'governance.status': { equals: 'draft' } },
        noNote(),
      ),
  },
  {
    key: 'sentByMe',
    title: 'I sent for review',
    help: 'Waiting for your approver. You will find it here until it is approved or sent back.',
    roles: AUTHORS,
    target: 'governed',
    draft: true,
    where: ({ userId }) =>
      all(
        { 'governance.createdBy': { equals: userId } },
        { 'governance.status': { equals: 'in_review' } },
      ),
  },
  {
    key: 'stale',
    title: 'Needs a fresh check',
    help: 'Live pages whose review date has passed. Check the facts and mark them verified again.',
    roles: REVIEWERS,
    target: 'governed',
    draft: false,
    where: ({ now, actor, collection }) =>
      inMyScope(
        all(
          { 'governance.status': { equals: 'published' } },
          any(
            { 'governance.verificationStatus': { equals: 'stale' } },
            { 'governance.reviewDueAt': { less_than_equal: now.toISOString() } },
          ),
        ),
        actor,
        collection,
      ),
  },
  {
    key: 'expiring',
    title: 'Expiring soon',
    help: `Live or approved items that end within ${EXPIRING_SOON_DAYS} days.`,
    roles: WRITERS,
    target: 'governed',
    draft: true,
    where: ({ now, actor, collection }) =>
      inMyScope(
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
        actor,
        collection,
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

/** The queues this person sees (a coordinator, for one, is an Editor with extra lists). */
export const queuesForActor = (actor: Actor): QueueSpec[] =>
  actor.kind !== 'user'
    ? []
    : QUEUES.filter((q) => q.roles.includes(actor.role) && (q.visible?.(actor) ?? true))
