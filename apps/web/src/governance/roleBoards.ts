/**
 * The board behind the head's and the coordinator's dashboards (slice 3am, changed in 3as): a head of
 * department has their department page and nothing else; a programme coordinator has their own
 * programme page(s). A programme's changes reach the head only as an item in their review tray.
 * Read with the person's own access, so nobody sees a page they could not open.
 */

import type { Payload, Where } from 'payload'

import { departmentHref, programmeHref } from '../site/organisation/shape'

import { describeParts, type PartStatus } from './pageSections'
import { actorFromUser } from './roles'

export type BoardStage = 'draft' | 'in_review' | 'approved' | 'published' | 'archived'

export interface BoardItem {
  collection: 'departments' | 'programmes'
  id: string | number
  name: string
  stage: BoardStage
  verified: boolean
  /** The head's reason, set when they sent it back; cleared when it is sent again. */
  sentBackNote: string | null
  updatedAt: string | null
  href: string
  /** The public address, only while the page is live. */
  liveHref: string | null
  /** The parts of the page this person controls, and which are filled. */
  parts: PartStatus[]
}

type UserLike = { id: string | number; role?: unknown; collection?: string }

const text = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null)
const STAGES: readonly string[] = ['draft', 'in_review', 'approved', 'published', 'archived']

export const hasBoard = (user: UserLike): boolean => {
  const actor = actorFromUser(user)
  if (actor.kind !== 'user') return false
  return (
    actor.role === 'approver' || (actor.role === 'editor' && (actor.programmes?.length ?? 0) > 0)
  )
}

/**
 * Which pages a person looks after: a head's department page (the departments owned by one of their
 * offices) or a coordinator's own programme pages. Published pages are public, so access alone would
 * list every department's; this keeps to what the person runs.
 */
function scopeOf(payload: Payload, user: UserLike) {
  const adminRoute = payload.config.routes?.admin ?? '/admin'
  const as = { user: { ...user, collection: 'users' } as never, overrideAccess: false }
  const actor = actorFromUser(user)
  const isHead = actor.kind === 'user' && actor.role === 'approver'
  const collection: 'departments' | 'programmes' = isHead ? 'departments' : 'programmes'
  const where: Where =
    actor.kind !== 'user'
      ? { id: { in: [-1] } }
      : isHead
        ? { 'governance.ownerOffice': { in: actor.offices.length > 0 ? actor.offices : ['-'] } }
        : { id: { in: (actor.programmes ?? []).map(String) } }
  return { adminRoute, as, collection, where }
}

export async function loadBoard(payload: Payload, user: UserLike): Promise<BoardItem[]> {
  if (!hasBoard(user)) return []
  const { adminRoute, as, collection, where } = scopeOf(payload, user)
  try {
    const res = await payload.find({
      collection,
      where,
      draft: true,
      depth: 0,
      limit: 100,
      pagination: false,
      sort: 'name',
      ...as,
    })
    return res.docs.map((d) => {
      const doc = d as unknown as Record<string, unknown> & {
        id: string | number
        governance?: Record<string, unknown>
      }
      const stage = String(doc.governance?.status ?? 'draft')
      return {
        collection,
        id: doc.id,
        name: text(doc.name) ?? `Untitled (#${doc.id})`,
        stage: (STAGES.includes(stage) ? stage : 'draft') as BoardStage,
        verified: doc.governance?.verificationStatus === 'verified',
        sentBackNote: text(doc.governance?.reviewNote),
        updatedAt: text(doc.updatedAt),
        href: `${adminRoute}/collections/${collection}/${doc.id}`,
        liveHref:
          stage === 'published' && text(doc.slug)
            ? collection === 'departments'
              ? departmentHref(text(doc.slug)!)
              : programmeHref(text(doc.slug)!)
            : null,
        parts: describeParts(collection, doc),
      }
    })
  } catch (e) {
    payload.logger.error({ err: e, collection }, 'role board query failed')
    return []
  }
}

/** One link in the left menu to a page the person runs (slice 3as). */
export interface PageLink {
  collection: 'departments' | 'programmes'
  id: string | number
  name: string
  href: string
}

/**
 * Just the names and addresses, for the left menu, which draws on every admin screen: the same
 * scope as `loadBoard` without the parts and the live address.
 */
export async function loadPageLinks(payload: Payload, user: UserLike): Promise<PageLink[]> {
  if (!hasBoard(user)) return []
  const { adminRoute, as, collection, where } = scopeOf(payload, user)
  try {
    const res = await payload.find({
      collection,
      where,
      draft: true,
      depth: 0,
      limit: 100,
      pagination: false,
      sort: 'name',
      select: { name: true },
      ...as,
    })
    return res.docs.map((d) => {
      const doc = d as unknown as { id: string | number; name?: unknown }
      return {
        collection,
        id: doc.id,
        name: text(doc.name) ?? `Untitled (#${doc.id})`,
        href: `${adminRoute}/collections/${collection}/${doc.id}`,
      }
    })
  } catch (e) {
    payload.logger.error({ err: e, collection }, 'page links query failed')
    return []
  }
}

/** Which dashboard a person gets. They differ in layout, not only in what they list. */
export type Desk = 'control' | 'readonly' | 'head' | 'coordinator' | 'desk' | 'contributor'

export function deskFor(user: { id: string | number; role?: unknown; programmes?: unknown }): Desk {
  const actor = actorFromUser(user as never)
  if (actor.kind !== 'user') return 'readonly'
  switch (actor.role) {
    case 'platformAdmin':
    case 'siteManager':
      return 'control'
    case 'auditor':
      return 'readonly'
    case 'approver':
      return 'head'
    case 'editor':
      return (actor.programmes?.length ?? 0) > 0 ? 'coordinator' : 'desk'
    default:
      return 'contributor'
  }
}
