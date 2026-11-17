/**
 * Importer input contract v0 (ADR 0009). The data pack is not in the repository, so this shape is a
 * proposal. `normaliseRecord` is the only function that knows it: when the real pack arrives, change it here.
 */

export type SourceRecord = {
  /** The old address, as the crawl saw it. Matched to the route map by `legacyKey`. */
  url: string
  title?: string
  /** Exact publish date (ISO), only if the pack has one. Never guessed from the address. */
  date?: string
  /** Old categories; the primary type comes from the route map, the rest become tags. */
  categories: string[]
  excerpt?: string
  text?: string
  attachments: { label?: string; url: string }[]
}

/** The pack files this importer reads, and the route-map collection each is expected to feed. */
export const PACK_FILES = ['news_posts.json', 'notices.json', 'events.json', 'jobs.json', 'tenders.json'] as const

/** Route-map collection name -> CMS collection slug. Everything else is deferred in this PR. */
export const ARTICLE_COLLECTIONS = {
  News: 'posts',
  Notices: 'notices',
  Events: 'events',
  Jobs: 'jobs',
  Tenders: 'tenders',
} as const
export type ArticleCollection = (typeof ARTICLE_COLLECTIONS)[keyof typeof ARTICLE_COLLECTIONS]

/** Crawl date, from Addendum section 8 rule 1. */
/** Midnight UTC written out in full: a bare date is read in the machine's time zone and can land on the day before. */
export const DEFAULT_COLLECTED_AT = '2026-11-06T00:00:00.000Z'

const str = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined)

/** A pack record of unknown shape -> SourceRecord, or null if it has no address. */
export function normaliseRecord(raw: unknown): SourceRecord | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const url = str(r.url)
  if (!url) return null
  const date = str(r.date)
  return {
    url,
    title: str(r.title),
    date: date && !Number.isNaN(Date.parse(date)) ? new Date(date).toISOString() : undefined,
    categories: Array.isArray(r.categories) ? r.categories.map(str).filter((c): c is string => !!c) : [],
    excerpt: str(r.excerpt),
    text: str(r.text),
    attachments: Array.isArray(r.attachments)
      ? r.attachments.flatMap((a) => {
          const u = a && typeof a === 'object' ? str((a as Record<string, unknown>).url) : undefined
          return u ? [{ label: str((a as Record<string, unknown>).label), url: u }] : []
        })
      : [],
  }
}

/** The records in one parsed pack file: an array, or `{ items: [...] }`. */
export function recordsOf(parsed: unknown): unknown[] {
  if (Array.isArray(parsed)) return parsed
  if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { items?: unknown }).items))
    return (parsed as { items: unknown[] }).items
  return []
}
