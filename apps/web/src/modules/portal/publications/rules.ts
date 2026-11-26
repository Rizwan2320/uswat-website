/** Pure rules for harvested works (FP-12, FPR-05): matching keys and strict validation of anything a source returns. */
import { WORK_TYPES, type Candidate, type WorkType } from './types'

export const LIMITS = { title: 500, venue: 200, author: 100, authors: 100, doi: 200, minYear: 1900, url: 500 } as const

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
  let workType: WorkType = 'article'
  if (r.workType !== undefined) {
    if (!isWorkType(r.workType)) return null
    workType = r.workType
  }
  // A bad link on an imported record loses the link, not the whole record.
  const url = typeof r.url === 'string' ? (normaliseUrl(r.url) ?? '') : ''
  return { title, year: r.year, venue, doi, authors, workType, url }
}

export type WorkField = 'title' | 'authors' | 'year' | 'venue' | 'doi' | 'url' | 'type'
export type WorkInput = { workType: string; title: string; authors: string; year: string; venue: string; doi: string; url: string }

/** The form's checks, one field at a time so the screen can say which box is wrong. A bad link here is an error (the person typed it). */
export function validateWorkInput(raw: unknown, now: number): { ok: true; work: Candidate } | { ok: false; field: WorkField } {
  if (typeof raw !== 'object' || raw === null) return { ok: false, field: 'title' }
  const r = raw as Record<string, unknown>
  const str = (k: string) => (typeof r[k] === 'string' ? (r[k] as string) : null)
  const type = str('workType')
  if (type === null || !isWorkType(type)) return { ok: false, field: 'type' }
  const title = str('title')
  if (title === null || clean(title) === '' || [...clean(title)].length > LIMITS.title) return { ok: false, field: 'title' }
  const authorsText = str('authors')
  const authors = authorsText === null ? [] : splitAuthors(authorsText)
  if (authors.length === 0 || authors.length > LIMITS.authors || authors.some((a) => [...a].length > LIMITS.author)) return { ok: false, field: 'authors' }
  const yearText = str('year')
  const year = yearText !== null && /^\d{4}$/.test(yearText.trim()) ? Number(yearText.trim()) : NaN
  if (!Number.isInteger(year) || year < LIMITS.minYear || year > new Date(now).getUTCFullYear() + 1) return { ok: false, field: 'year' }
  const venue = clean(str('venue') ?? '')
  if ([...venue].length > LIMITS.venue) return { ok: false, field: 'venue' }
  const doiText = str('doi') ?? ''
  let doi = ''
  if (doiText.trim() !== '') {
    const d = normaliseDoi(doiText)
    if (d === null) return { ok: false, field: 'doi' }
    doi = d
  }
  const urlText = str('url') ?? ''
  let url = ''
  if (urlText.trim() !== '') {
    const u = normaliseUrl(urlText)
    if (u === null) return { ok: false, field: 'url' }
    url = u
  }
  return { ok: true, work: { title: clean(title), year, venue, doi, authors, workType: type, url } }
}

export const isWorkType = (v: unknown): v is WorkType => typeof v === 'string' && (WORK_TYPES as readonly string[]).includes(v)

/** An http(s) link without credentials, or null. Anything else (javascript:, data:, a bare word) is refused, never repaired. */
export function normaliseUrl(raw: string): string | null {
  const t = raw.trim()
  if (t === '' || t.length > LIMITS.url || /[\s\u0000-\u001F\u007F]/.test(t)) return null
  let u: URL
  try {
    u = new URL(t)
  } catch {
    return null
  }
  if ((u.protocol !== 'http:' && u.protocol !== 'https:') || u.username !== '' || u.password !== '' || u.hostname === '') return null
  return u.toString().length <= LIMITS.url ? u.toString() : null
}

/** Authors typed in one box: one per line, or separated by semicolons. Returns cleaned names (not yet length-checked). */
export function splitAuthors(text: string): string[] {
  return text.split(/[\n;]+/).map(clean).filter((n) => n !== '')
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const isWorkId = (v: unknown): v is string => typeof v === 'string' && UUID.test(v)
