/** Works by ORCID iD from OpenAlex, as a `CandidateSource`. Off unless `PORTAL_PUBLICATIONS_SOURCE=openalex`. */
import { getJson, type Fetcher } from './http'
import type { CandidateSource } from './types'

const ORCID = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/
const TYPES: Record<string, string> = { article: 'article', review: 'article', preprint: 'article', letter: 'article', 'book-chapter': 'chapter', book: 'book', dissertation: 'thesis', report: 'report' }
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Exported for tests. A work with more than 100 authors keeps the first 100 (the list is for display, not credit). */
export function openAlexToRecord(w: unknown): unknown {
  if (!isObj(w)) return null
  const loc = isObj(w.primary_location) ? w.primary_location : null
  const src = loc && isObj(loc.source) && typeof loc.source.display_name === 'string' ? loc.source.display_name : ''
  const oa = isObj(w.open_access) && typeof w.open_access.oa_url === 'string' ? w.open_access.oa_url : ''
  const authors = (Array.isArray(w.authorships) ? w.authorships : []).flatMap((a) => (isObj(a) && isObj(a.author) && typeof a.author.display_name === 'string' ? [a.author.display_name] : []))
  return {
    title: typeof w.title === 'string' ? w.title : '',
    year: typeof w.publication_year === 'number' ? w.publication_year : Number.NaN,
    venue: src,
    doi: typeof w.doi === 'string' ? w.doi : '',
    authors: authors.slice(0, 100),
    workType: typeof w.type === 'string' ? (TYPES[w.type] ?? 'other') : 'other',
    url: oa,
  }
}

export function createOpenAlexSource(opts: { fetchImpl?: Fetcher; timeoutMs?: number; mailto?: string; maxPages?: number } = {}): CandidateSource {
  const maxPages = opts.maxPages ?? 3
  return {
    sample: false,
    async fetch(orcid: string) {
      if (!ORCID.test(orcid)) throw new Error('orcid shape')
      const out: unknown[] = []
      for (let page = 1; page <= maxPages; page++) {
        const u = new URL('https://api.openalex.org/works')
        u.searchParams.set('filter', `authorships.author.orcid:https://orcid.org/${orcid}`)
        u.searchParams.set('per-page', '100')
        u.searchParams.set('page', String(page))
        u.searchParams.set('select', 'title,publication_year,doi,type,primary_location,authorships,open_access')
        if (opts.mailto && /^[^\s@&?]+@[^\s@&?]+\.[^\s@&?]+$/.test(opts.mailto)) u.searchParams.set('mailto', opts.mailto)
        const r = await getJson(u.toString(), opts.fetchImpl, opts.timeoutMs)
        if (!r.ok) throw new Error('openalex')
        const results = isObj(r.json) && Array.isArray(r.json.results) ? r.json.results : null
        if (!results) throw new Error('openalex shape')
        out.push(...results.map(openAlexToRecord))
        if (results.length < 100) break
      }
      return out
    },
  }
}
