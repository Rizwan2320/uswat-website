/**
 * Import of a publication list from a file the person chooses: BibTeX, RIS or CSV. Pure functions, no dependency. The output is raw
 * records for `validateCandidate`, which does the real checking; this code only has to be safe and linear on hostile input
 * (size and record caps, no backtracking patterns, an unclosed entry stops the scan instead of rescanning).
 * File text is data. It is never run, never rendered as HTML.
 */
import { mapWorkType } from './workTypes'

export const IMPORT_LIMITS = { chars: 200_000, records: 500 } as const
export type ImportFormat = 'bibtex' | 'ris' | 'csv'
export type RawRecord = { title: string; year: number; venue: string; doi: string; authors: string[]; workType?: string; url: string }
export type ParsedImport = { ok: true; format: ImportFormat; records: RawRecord[]; truncated: boolean } | { ok: false; error: 'size' | 'format' }

const stripBom = (s: string) => (s.charCodeAt(0) === 0xfeff ? s.slice(1) : s)
const squash = (s: string) => s.replace(/\s+/g, ' ').trim()
const yearOf = (s: string): number => {
  const m = /\d{4}/.exec(s)
  return m ? Number(m[0]) : Number.NaN
}
/** "Last, First" becomes "First Last"; anything else is left alone. */
export function flipName(n: string): string {
  const parts = n.split(',')
  return parts.length === 2 && parts[0].trim() !== '' && parts[1].trim() !== '' ? `${parts[1].trim()} ${parts[0].trim()}` : n.trim()
}

export function detectFormat(text: string, filename = ''): ImportFormat | null {
  const f = filename.toLowerCase()
  if (f.endsWith('.bib') || f.endsWith('.bibtex')) return 'bibtex'
  if (f.endsWith('.ris')) return 'ris'
  if (f.endsWith('.csv')) return 'csv'
  const head = stripBom(text).trimStart().slice(0, 4000)
  if (head.startsWith('@')) return 'bibtex'
  if (/^TY {2}- /m.test(head)) return 'ris'
  const first = head.split(/\r?\n/, 1)[0].toLowerCase()
  if (first.includes(',') && /title/.test(first)) return 'csv'
  return null
}

// ---- BibTeX ---------------------------------------------------------------------------------------------------------------

const ACCENTS: Record<string, string> = { "'": '\u0301', '`': '\u0300', '^': '\u0302', '"': '\u0308', '~': '\u0303', '=': '\u0304', '.': '\u0307' }
function unlatex(s: string): string {
  return squash(
    s
      .replace(/\\([`'^"~=.])\s*\{?\\?([A-Za-z])\}?/g, (_m, a: string, c: string) => c + ACCENTS[a])
      .replace(/\\([&%_$#])/g, '$1')
      .replace(/[{}]/g, '')
      .replace(/~/g, ' ')
      .normalize('NFC'),
  )
}

/** Reads a balanced `{...}` starting at `i` (which must be '{'). Returns the inside and the index after the closing brace, or null. */
function readBraced(t: string, i: number): { inner: string; next: number } | null {
  let depth = 0
  for (let j = i; j < t.length; j++) {
    const c = t[j]
    if (c === '\\') j++
    else if (c === '{') depth++
    else if (c === '}' && --depth === 0) return { inner: t.slice(i + 1, j), next: j + 1 }
  }
  return null
}

function readFields(body: string): Map<string, string> {
  const out = new Map<string, string>()
  let i = body.indexOf(',')
  if (i < 0) return out
  i++
  while (i < body.length) {
    while (i < body.length && /[\s,]/.test(body[i])) i++
    const nm = /^[A-Za-z][A-Za-z0-9_-]*/.exec(body.slice(i, i + 40))
    if (!nm) break
    const name = nm[0].toLowerCase()
    i += nm[0].length
    while (i < body.length && /\s/.test(body[i])) i++
    if (body[i] !== '=') break
    i++
    let value = ''
    for (;;) {
      while (i < body.length && /\s/.test(body[i])) i++
      if (body[i] === '{') {
        const b = readBraced(body, i)
        if (!b) return out
        value += b.inner
        i = b.next
      } else if (body[i] === '"') {
        let j = i + 1
        let depth = 0
        while (j < body.length && !(body[j] === '"' && depth === 0)) {
          if (body[j] === '\\') j++
          else if (body[j] === '{') depth++
          else if (body[j] === '}') depth--
          j++
        }
        value += body.slice(i + 1, j)
        i = j + 1
      } else {
        const m = /^[^,#}\s]+/.exec(body.slice(i, i + 200))
        if (m) {
          value += m[0]
          i += m[0].length
        }
      }
      while (i < body.length && /\s/.test(body[i])) i++
      if (body[i] === '#') i++
      else break
    }
    if (!out.has(name)) out.set(name, value)
  }
  return out
}

export function parseBibtex(text: string): { records: RawRecord[]; truncated: boolean } {
  const t = stripBom(text)
  const records: RawRecord[] = []
  let at = 0
  let truncated = false
  for (;;) {
    at = t.indexOf('@', at)
    if (at < 0) break
    const head = /^@\s*([A-Za-z]+)\s*\{/.exec(t.slice(at, at + 60))
    if (!head) {
      at++
      continue
    }
    const open = at + head[0].length - 1
    const b = readBraced(t, open)
    if (!b) break // unclosed entry: stop, do not rescan the rest for every later '@'
    at = b.next
    const kind = head[1].toLowerCase()
    if (kind === 'comment' || kind === 'string' || kind === 'preamble') continue
    if (records.length >= IMPORT_LIMITS.records) {
      truncated = true
      break
    }
    const f = readFields(b.inner)
    const authors = (f.get('author') ?? f.get('editor') ?? '')
      .split(/\s+and\s+/i)
      .map((a) => unlatex(a))
      .filter((a) => a !== '' && a.toLowerCase() !== 'others')
      .map(flipName)
    records.push({
      title: unlatex(f.get('title') ?? ''),
      year: yearOf(f.get('year') ?? f.get('date') ?? ''),
      venue: unlatex(f.get('journal') ?? f.get('journaltitle') ?? f.get('booktitle') ?? f.get('publisher') ?? f.get('school') ?? f.get('institution') ?? f.get('howpublished') ?? ''),
      doi: unlatex(f.get('doi') ?? ''),
      authors,
      workType: kind === 'misc' ? 'other' : mapWorkType(kind),
      url: unlatex(f.get('url') ?? ''),
    })
  }
  return { records, truncated }
}

// ---- RIS --------------------------------------------------------------------------------------------------------------------

const RIS_TYPES: Record<string, string> = { JOUR: 'article', JFULL: 'article', EJOUR: 'article', CONF: 'conference', CPAPER: 'conference', CHAP: 'chapter', BOOK: 'book', EBOOK: 'book', THES: 'thesis', PAT: 'patent', RPRT: 'report' }
const RIS_VENUE = ['JF', 'JO', 'T2', 'BT', 'JA', 'PB']

export function parseRis(text: string): { records: RawRecord[]; truncated: boolean } {
  const records: RawRecord[] = []
  let truncated = false
  let cur: Map<string, string[]> | null = null
  const flush = () => {
    if (!cur) return
    const c = cur
    cur = null
    if (records.length >= IMPORT_LIMITS.records) {
      truncated = true
      return
    }
    const first = (...tags: string[]) => {
      for (const t of tags) {
        const v = c.get(t)?.[0]
        if (v !== undefined && v !== '') return v
      }
      return ''
    }
    records.push({
      title: squash(first('TI', 'T1')),
      year: yearOf(first('PY', 'Y1', 'DA')),
      venue: squash(first(...RIS_VENUE)),
      doi: first('DO'),
      authors: [...(c.get('AU') ?? c.get('A1') ?? [])].map((a) => flipName(squash(a))).filter((a) => a !== ''),
      workType: RIS_TYPES[first('TY').toUpperCase()] ?? 'other',
      url: first('UR', 'L1', 'L2'),
    })
  }
  for (const line of stripBom(text).split(/\r?\n/)) {
    const m = /^([A-Z][A-Z0-9]) {2}-\s?(.*)$/.exec(line)
    if (!m) continue
    if (m[1] === 'TY') {
      flush()
      cur = new Map()
    }
    if (m[1] === 'ER') {
      flush()
      continue
    }
    if (!cur) continue
    const list = cur.get(m[1]) ?? []
    list.push(m[2].trim())
    cur.set(m[1], list)
  }
  flush()
  return { records, truncated }
}

// ---- CSV --------------------------------------------------------------------------------------------------------------------

/** RFC 4180 reader: quoted cells, doubled quotes, line breaks inside quotes. Stops growing at the record cap. */
export function readCsv(text: string, maxRows: number): string[][] {
  const t = stripBom(text)
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (quoted) {
      if (c === '"') {
        if (t[i + 1] === '"') {
          cell += '"'
          i++
        } else quoted = false
      } else cell += c
    } else if (c === '"' && cell === '') quoted = true
    else if (c === ',') {
      row.push(cell)
      cell = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++
      row.push(cell)
      cell = ''
      if (row.some((x) => x !== '')) rows.push(row)
      row = []
      if (rows.length > maxRows) return rows
    } else cell += c
  }
  row.push(cell)
  if (row.some((x) => x !== '')) rows.push(row)
  return rows
}

const COLS: Record<string, string[]> = {
  title: ['title'],
  year: ['year', 'publication year', 'publication_year'],
  venue: ['venue', 'journal', 'source', 'booktitle', 'publisher'],
  doi: ['doi'],
  authors: ['authors', 'author'],
  type: ['type', 'work type', 'worktype'],
  url: ['url', 'link'],
}

export function parseCsv(text: string): { records: RawRecord[]; truncated: boolean } {
  const rows = readCsv(text, IMPORT_LIMITS.records + 1)
  if (rows.length === 0) return { records: [], truncated: false }
  const head = rows[0].map((h) => h.trim().toLowerCase())
  const col = (k: string) => head.findIndex((h) => COLS[k].includes(h))
  const idx = Object.fromEntries(Object.keys(COLS).map((k) => [k, col(k)])) as Record<string, number>
  if (idx.title < 0) return { records: [], truncated: false }
  const body = rows.slice(1)
  const truncated = body.length > IMPORT_LIMITS.records
  const get = (r: string[], k: string) => (idx[k] >= 0 ? (r[idx[k]] ?? '') : '')
  const records = body.slice(0, IMPORT_LIMITS.records).map((r): RawRecord => {
    const a = get(r, 'authors')
    const authors = (a.includes(';') || a.includes('\n') ? a.split(/[;\n]+/).map(flipName) : /\sand\s/i.test(a) ? a.split(/\s+and\s+/i) : [a]).map(squash).filter((x) => x !== '')
    const type = get(r, 'type').trim()
    return { title: squash(get(r, 'title')), year: yearOf(get(r, 'year')), venue: squash(get(r, 'venue')), doi: get(r, 'doi').trim(), authors, workType: type === '' ? undefined : mapWorkType(type), url: get(r, 'url').trim() }
  })
  return { records, truncated }
}

// ---- entry point ----------------------------------------------------------------------------------------------------------

export function parseImport(text: unknown, filename?: unknown): ParsedImport {
  if (typeof text !== 'string') return { ok: false, error: 'format' }
  if (text.length > IMPORT_LIMITS.chars) return { ok: false, error: 'size' }
  const format = detectFormat(text, typeof filename === 'string' ? filename : '')
  if (!format) return { ok: false, error: 'format' }
  const r = format === 'bibtex' ? parseBibtex(text) : format === 'ris' ? parseRis(text) : parseCsv(text)
  return r.records.length === 0 ? { ok: false, error: 'format' } : { ok: true, format, records: r.records, truncated: r.truncated }
}
