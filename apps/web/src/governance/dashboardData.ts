/**
 * Loads the editor dashboard (CMS-09) with the signed-in user's own access, so a person only
 * ever counts and sees what they may already read. The queues themselves are in dashboard.ts.
 */

import type { CollectionConfig, Payload } from 'payload'

import { queuesFor, type QueueKey, type QueueSpec } from './dashboard'
import { actorFromUser } from './roles'

export interface QueueItem {
  collection: string
  collectionLabel: string
  id: string | number
  title: string
  updatedAt: string | null
  href: string
}

export interface QueueResult {
  key: QueueKey
  title: string
  help: string
  /** Matching records across every collection the person may read. */
  total: number
  /** The most recently changed few. */
  items: QueueItem[]
  /** True when a collection could not be read, so the total may be too low. */
  partial: boolean
}

export const ITEMS_PER_QUEUE = 8
const PER_COLLECTION = 5

type UserLike = { id: string | number; role?: unknown; collection?: string }

const hasGovernance = (c: CollectionConfig): boolean =>
  c.fields.some((f) => f.type === 'group' && 'name' in f && f.name === 'governance')

function labelOf(c: CollectionConfig): string {
  const plural = c.labels?.plural
  if (typeof plural === 'string') return plural
  if (plural && typeof plural === 'object' && 'en' in plural) return String(plural.en)
  return c.slug
}

const textOf = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null)

export async function loadDashboard(
  payload: Payload,
  user: UserLike,
  now: Date = new Date(),
): Promise<QueueResult[]> {
  const actor = actorFromUser(user)
  if (actor.kind !== 'user') return []
  const adminRoute = payload.config.routes?.admin ?? '/admin'
  const governed = payload.config.collections.filter(hasGovernance)
  const media = payload.config.collections.filter((c) => c.slug === 'media')

  const run = async (spec: QueueSpec): Promise<QueueResult> => {
    const targets = spec.target === 'media' ? media : governed
    let partial = false
    const perCollection = await Promise.all(
      targets.map(async (c) => {
        try {
          const res = await payload.find({
            collection: c.slug as 'pages',
            where: spec.where({ userId: user.id, now }),
            draft: spec.draft,
            depth: 0,
            limit: PER_COLLECTION,
            sort: '-updatedAt',
            user: { ...user, collection: 'users' } as never,
            overrideAccess: false,
          })
          const titleField = c.admin?.useAsTitle
          const items: QueueItem[] = res.docs.map((d) => {
            const doc = d as unknown as Record<string, unknown> & { id: string | number }
            return {
              collection: c.slug,
              collectionLabel: labelOf(c),
              id: doc.id,
              title:
                (titleField && textOf(doc[titleField])) ||
                textOf(doc.filename) ||
                // Opening a create form saves an empty draft straight away, so these exist.
                `Untitled (started ${String(doc.updatedAt ?? '').slice(0, 10)}, #${doc.id})`,
              updatedAt: textOf(doc.updatedAt),
              href: `${adminRoute}/collections/${c.slug}/${doc.id}`,
            }
          })
          return { total: res.totalDocs, items }
        } catch (e) {
          partial = true
          payload.logger.error(
            { err: e, collection: c.slug, queue: spec.key },
            'dashboard query failed',
          )
          return { total: 0, items: [] as QueueItem[] }
        }
      }),
    )
    const items = perCollection
      .flatMap((r) => r.items)
      .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
      .slice(0, ITEMS_PER_QUEUE)
    return {
      key: spec.key,
      title: spec.title,
      help: spec.help,
      total: perCollection.reduce((n, r) => n + r.total, 0),
      items,
      partial,
    }
  }

  return Promise.all(queuesFor(actor.role).map(run))
}
