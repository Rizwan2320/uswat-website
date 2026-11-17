/* Pure helpers for the search page. Nothing here opens the CMS, so unit tests can use it. */

export const PER_PAGE = 20
export const MAX_QUERY = 100
export const MAX_PAGE = 100

/** Where each searchable collection lives on the public site (the same addresses the route map uses). */
const PATHS: Record<string, string | null> = {
  pages: null, // /{slug}
  posts: 'news',
  notices: 'notices',
  events: 'events',
  jobs: 'jobs',
  tenders: 'tenders',
}
const LABELS: Record<string, string> = { pages: 'Page', posts: 'News', notices: 'Notice', events: 'Event', jobs: 'Job', tenders: 'Tender' }

export const typeLabel = (relationTo: string) => LABELS[relationTo] ?? null

/** The public address of a hit, or null when the collection has no public page (so it is not shown as a dead link). */
export function resultHref(relationTo: string, slug: string): string | null {
  if (!slug || !(relationTo in PATHS)) return null
  const dir = PATHS[relationTo]
  return dir ? `/${dir}/${encodeURIComponent(slug)}` : `/${encodeURIComponent(slug)}`
}

export type SearchParams = { q: string; page: number }

/** `?q=` and `?page=` from the address: trimmed and capped, a page outside 1 to 100 falls back to 1. */
export function parseSearchParams(sp: { q?: string | string[]; page?: string | string[] }): SearchParams {
  const raw = Array.isArray(sp.q) ? sp.q[0] : sp.q
  const q = (raw ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_QUERY)
  const p = Number(Array.isArray(sp.page) ? sp.page[0] : sp.page)
  return { q, page: Number.isInteger(p) && p >= 1 && p <= MAX_PAGE ? p : 1 }
}

export const searchHref = ({ q, page }: SearchParams) =>
  `/search?q=${encodeURIComponent(q)}${page > 1 ? `&page=${page}` : ''}`

export type Hit = { id: number | string; title: string; href: string; type: string | null; description: string | null }

type Doc = Record<string, unknown> & { id: number | string }
const s = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null)

export function toHit(d: Doc): Hit | null {
  const doc = d.doc as { relationTo?: unknown } | null | undefined
  const relationTo = typeof doc?.relationTo === 'string' ? doc.relationTo : ''
  const meta = (d.meta ?? {}) as { title?: unknown; description?: unknown }
  const title = s(d.title) ?? s(meta.title)
  const href = resultHref(relationTo, s(d.slug) ?? '')
  if (!title || !href) return null
  return { id: d.id, title, href, type: typeLabel(relationTo), description: s(meta.description) }
}
