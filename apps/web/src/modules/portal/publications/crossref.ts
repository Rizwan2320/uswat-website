/** Look up one DOI at Crossref and map the answer to a raw record. The record still goes through `validateCandidate`. */
import { getJson, type Fetcher } from './http'
import { normaliseDoi } from './rules'

export type DoiLookup = (doi: string) => Promise<{ ok: true; record: unknown } | { ok: false; error: 'notfound' | 'source' }>

const strip = (s: string) =>
  s
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

const TYPES: Record<string, string> = {
  'journal-article': 'article',
  'proceedings-article': 'conference',
  'book-chapter': 'chapter',
  'book-section': 'chapter',
  book: 'book',
  monograph: 'book',
  'edited-book': 'book',
  'reference-book': 'book',
  dissertation: 'thesis',
  report: 'report',
  'posted-content': 'article',
}

const first = (v: unknown): string => (Array.isArray(v) && typeof v[0] === 'string' ? v[0] : '')
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

function yearOf(m: Record<string, unknown>): number {
  for (const k of ['issued', 'published-print', 'published-online', 'published', 'created']) {
    const o = m[k]
    const parts = isObj(o) && Array.isArray(o['date-parts']) ? o['date-parts'][0] : null
    if (Array.isArray(parts) && typeof parts[0] === 'number') return parts[0]
  }
  return Number.NaN
}

/** Exported for tests. `message` is the `message` member of a Crossref /works/{doi} answer. */
export function crossrefToRecord(message: unknown): unknown {
  if (!isObj(message)) return null
  const people = (Array.isArray(message.author) && message.author.length > 0 ? message.author : Array.isArray(message.editor) ? message.editor : []) as unknown[]
  const authors = people.flatMap((p) => {
    if (!isObj(p)) return []
    const n = [p.given, p.family].filter((x): x is string => typeof x === 'string' && x !== '').join(' ') || (typeof p.name === 'string' ? p.name : '')
    return n === '' ? [] : [strip(n)]
  })
  const ev = isObj(message.event) && typeof message.event.name === 'string' ? message.event.name : ''
  const primary = isObj(message.resource) && isObj(message.resource.primary) && typeof message.resource.primary.URL === 'string' ? message.resource.primary.URL : ''
  return {
    title: strip(first(message.title)),
    year: yearOf(message),
    venue: strip(first(message['container-title']) || ev || (typeof message.publisher === 'string' ? message.publisher : '')),
    doi: typeof message.DOI === 'string' ? message.DOI : '',
    authors: authors.slice(0, 100),
    workType: typeof message.type === 'string' ? (TYPES[message.type] ?? 'other') : 'other',
    url: primary,
  }
}

export function createCrossrefLookup(opts: { fetchImpl?: Fetcher; timeoutMs?: number; mailto?: string } = {}): DoiLookup {
  const mailto = opts.mailto && /^[^\s@&?]+@[^\s@&?]+\.[^\s@&?]+$/.test(opts.mailto) ? `?mailto=${encodeURIComponent(opts.mailto)}` : ''
  return async (doi) => {
    const d = normaliseDoi(doi)
    if (!d) return { ok: false, error: 'notfound' }
    const r = await getJson(`https://api.crossref.org/works/${encodeURIComponent(d)}${mailto}`, opts.fetchImpl, opts.timeoutMs)
    if (!r.ok) return { ok: false, error: r.status === 404 ? 'notfound' : 'source' }
    const msg = isObj(r.json) ? r.json.message : null
    const record = crossrefToRecord(msg)
    return record ? { ok: true, record } : { ok: false, error: 'source' }
  }
}
