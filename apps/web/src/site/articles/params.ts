/**
 * Listing addresses take a fixed set of query parameters so crawlers cannot create endless URLs
 * (Addendum section 5). Anything else is ignored, and a malformed value falls back to the default.
 */
export type ListingView = 'current' | 'archive'
export type ListingParams = { page: number; year?: number; view: ListingView }

type Raw = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export const MAX_PAGE = 500
export const FIRST_YEAR = 2000

export function parseListingParams(raw: Raw, nowYear: number): ListingParams {
  const page = /^\d{1,3}$/.test(one(raw.page) ?? '') ? Number(one(raw.page)) : 1
  const y = /^\d{4}$/.test(one(raw.year) ?? '') ? Number(one(raw.year)) : undefined
  return {
    page: page >= 1 && page <= MAX_PAGE ? page : 1,
    year: y !== undefined && y >= FIRST_YEAR && y <= nowYear ? y : undefined,
    view: one(raw.view) === 'archive' ? 'archive' : 'current',
  }
}

/** The canonical address of a listing page: only parameters that differ from the default. */
export function listingHref(path: string, p: Partial<ListingParams>): string {
  const q = new URLSearchParams()
  if (p.view === 'archive') q.set('view', 'archive')
  if (p.year) q.set('year', String(p.year))
  if (p.page && p.page > 1) q.set('page', String(p.page))
  const s = q.toString()
  return `/${path}${s ? `?${s}` : ''}`
}
