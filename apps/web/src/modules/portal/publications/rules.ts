/** Pure rules for harvested works (FP-12, FPR-05): matching keys and strict validation of anything a source returns. */
import type { Candidate } from './types'

export const LIMITS = { title: 500, venue: 200, author: 100, authors: 100, doi: 200, minYear: 1900 } as const

/** Lower-case DOI without the resolver prefix, or null when it is empty or not shaped like a DOI. */
export function normaliseDoi(raw: string): string | null {
  const t = raw.trim().replace(/^(https?:\/\/)?(dx\.)?doi\.org\//i, '').replace(/^doi:\s*/i, '').trim().toLowerCase()
  if (t === '' || t.length > LIMITS.doi) return null
  return /^10\.\d{4,9}\/\S+$/.test(t) ? t : null
}

/** Title key: letters and digits only (any script, so Urdu is kept), accents folded, case folded, spaces collapsed; year appended. */
export function titleKey(title: string, year: number): string {
  const t = title
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
  return `${t}|${year}`
}

const CONTROL = /[\u0000-\u001F\u007F-\u009F‪-‮⁦-⁩]/g
const clean = (s: string) => s.replace(CONTROL, ' ').replace(/\s+/g, ' ').trim()

/** Strict import validation. Returns a cleaned candidate or null; a source's bad record is dropped, never stored. */
export function validateCandidate(raw: unknown, now: number): Candidate | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  if (typeof r.title !== 'string' || typeof r.venue !== 'string' || typeof r.doi !== 'string' || !Array.isArray(r.authors)) return null
  if (typeof r.year !== 'number' || !Number.isInteger(r.year)) return null
  const maxYear = new Date(now).getUTCFullYear() + 1
  if (r.year < LIMITS.minYear || r.year > maxYear) return null
  const title = clean(r.title)
  if (title === '' || [...title].length > LIMITS.title) return null
  const venue = clean(r.venue)
  if ([...venue].length > LIMITS.venue) return null
  let doi = ''
  if (r.doi.trim() !== '') {
    const d = normaliseDoi(r.doi)
    if (d === null) return null
    doi = d
  }
  if (r.authors.length === 0 || r.authors.length > LIMITS.authors) return null
  const authors: string[] = []
  for (const a of r.authors) {
    if (typeof a !== 'string') return null
    const n = clean(a)
    if (n === '' || [...n].length > LIMITS.author) return null
    authors.push(n)
  }
  return { title, year: r.year, venue, doi, authors }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const isWorkId = (v: unknown): v is string => typeof v === 'string' && UUID.test(v)
