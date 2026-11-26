/**
 * The board behind the head's and the coordinator's dashboards (slice 3am): the department page
 * and the programme pages a person looks after, each with where it stands. Read with the person's
 * own access, so a coordinator gets their own programmes and a head their department's, and
 * nobody sees a page they could not open.
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
  /** The coordinators of a programme, by name (only filled for a head). */
  coordinators: string[]
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

export async function loadBoard(payload: Payload, user: UserLike): Promise<BoardItem[]> {
  if (!hasBoard(user)) return []
  const adminRoute = payload.config.routes?.admin ?? '/admin'
  const as = { user: { ...user, collection: 'users' } as never, overrideAccess: false }

  const actor = actorFromUser(user)
  const isHead = actor.kind === 'user' && actor.role === 'approver'
  // Published pages are public, so access alone would list every department's. Keep to what this
  // person looks after: a head's offices, a coordinator's own programmes.
  const mine = (collection: 'departments' | 'programmes'): Where =>
    actor.kind !== 'user'
      ? { id: { in: [-1] } }
      : isHead
        ? { 'governance.ownerOffice': { in: actor.offices.length > 0 ? actor.offices : ['-'] } }
        : collection === 'programmes'
          ? { id: { in: (actor.programmes ?? []).map(String) } }
          : { id: { in: [-1] } }

  const read = async (collection: 'departments' | 'programmes'): Promise<BoardItem[]> => {
    try {
      const res = await payload.find({
        collection,
        where: mine(collection),
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
          coordinators: [],
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

  const [departments, programmes] = await Promise.all([
    isHead ? read('departments') : Promise.resolve([] as BoardItem[]),
    read('programmes'),
  ])

  if (isHead && programmes.length > 0) {
    try {
      const people = await payload.find({
        collection: 'users',
        where: { programmes: { in: programmes.map((p) => p.id) } },
        depth: 0,
        limit: 200,
        pagination: false,
        ...as,
      })
      for (const person of people.docs) {
        const p = person as unknown as { name?: unknown; email?: unknown; programmes?: unknown }
        const who = text(p.name) ?? text(p.email) ?? 'A coordinator'
        const ids = Array.isArray(p.programmes)
          ? p.programmes.map((x) => String((x as { id?: unknown })?.id ?? x))
          : []
        for (const prog of programmes)
          if (ids.includes(String(prog.id))) prog.coordinators.push(who)
      }
    } catch (e) {
      payload.logger.error({ err: e }, 'role board coordinators query failed')
    }
  }
  return [...departments, ...programmes]
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
