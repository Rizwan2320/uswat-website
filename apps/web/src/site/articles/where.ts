import type { Where } from 'payload'

import { currentWhere } from '@/governance/lifecycle'

import type { TypeConfig } from './config'
import { isClosed } from './format'
import type { ListingParams } from './params'

/* Pure parts of the public reads: what a listing asks for and how a record becomes a list item.
   Nothing here opens the CMS, so unit tests can use it. */

export type ListItem = {
  id: number | string
  title: string
  slug: string
  publishedAt: string | null
  excerpt: string | null
  startsAt: string | null
  venue: string | null
  closesAt: string | null
  closed: boolean
}

export type Listing = { items: ListItem[]; page: number; totalPages: number; totalDocs: number }

export type Doc = Record<string, unknown> & { id: number | string }
type Gov = { status?: string | null; expireAt?: string | null; pinned?: boolean | null } | null | undefined
export const s = (v: unknown): string | null => (typeof v === 'string' && v ? v : null)

/** The filter for records that have left current lists: archived, past their end, or (notices) aged out. */
export function archiveWhere(cfg: TypeConfig, now: Date): Where {
  const or: Where[] = [
    { 'governance.status': { equals: 'archived' } },
    { 'governance.expireAt': { less_than_equal: now.toISOString() } },
  ]
  if (cfg.current.ageOutDays && cfg.current.dateField) {
    const cutoff = new Date(now.getTime() - cfg.current.ageOutDays * 86_400_000).toISOString()
    or.push({
      and: [
        { 'governance.expireAt': { exists: false } },
        { 'governance.pinned': { not_equals: true } },
        { [cfg.current.dateField]: { less_than_equal: cutoff } },
      ],
    })
  }
  return { or }
}

export function listingWhere(cfg: TypeConfig, p: Pick<ListingParams, 'view' | 'year'>, now: Date): Where {
  const and: Where[] = [p.view === 'archive' ? archiveWhere(cfg, now) : currentWhere(now, cfg.current)]
  if (p.year) {
    and.push({ publishedAt: { greater_than_equal: new Date(Date.UTC(p.year, 0, 1)).toISOString() } })
    and.push({ publishedAt: { less_than: new Date(Date.UTC(p.year + 1, 0, 1)).toISOString() } })
  }
  return { and }
}

export function sortFor(cfg: TypeConfig, view: ListingParams['view']): string[] {
  if (cfg.kind === 'event') return view === 'archive' ? ['-startsAt', '-id'] : ['startsAt', 'id']
  return ['-publishedAt', '-id']
}

export const selectFor = (cfg: TypeConfig) =>
  ({
    title: true,
    slug: true,
    publishedAt: true,
    ...(cfg.hasExcerpt ? { excerpt: true } : {}),
    ...(cfg.kind === 'event' ? { startsAt: true, venue: true } : {}),
    governance: { status: true, expireAt: true, pinned: true },
  }) as never

export function toItem(cfg: TypeConfig, doc: Doc, now: Date): ListItem {
  const gov = doc.governance as Gov
  return {
    id: doc.id,
    title: s(doc.title) ?? '',
    slug: s(doc.slug) ?? '',
    publishedAt: s(doc.publishedAt),
    excerpt: cfg.hasExcerpt ? s(doc.excerpt) : null,
    startsAt: cfg.kind === 'event' ? s(doc.startsAt) : null,
    venue: cfg.kind === 'event' ? s(doc.venue) : null,
    closesAt: cfg.kind === 'deadline' || cfg.kind === 'event' ? s(gov?.expireAt) : null,
    closed: isClosed(gov, now),
  }
}
