/**
 * Export of a person's claimed works as BibTeX, RIS, CSV or a plain reference list. Built from the person's own rows only.
 * CSV cells that a spreadsheet could read as a formula are neutralised (CSV injection), and the file starts with a byte-order
 * mark so Excel reads Urdu and accented names correctly.
 */
import type { StoredWork, WorkType } from './types'

export type ExportFormat = 'bibtex' | 'ris' | 'csv' | 'text'
export const EXPORT_FORMATS: readonly ExportFormat[] = ['bibtex', 'ris', 'csv', 'text']
export type ExportFile = { filename: string; mime: string; text: string }

const sorted = (works: readonly StoredWork[]) => [...works].sort((a, b) => Number(b.featured) - Number(a.featured) || b.year - a.year || a.title.localeCompare(b.title))
const oneLine = (s: string) => s.replace(/[\r\n\u2028\u2029]+/g, ' ').replace(/\s+/g, ' ').trim()

// BibTeX
const BIB_TYPE: Record<WorkType, string> = { article: 'article', conference: 'inproceedings', chapter: 'incollection', book: 'book', thesis: 'phdthesis', report: 'techreport', patent: 'misc', other: 'misc' }
const BIB_VENUE: Record<WorkType, string> = { article: 'journal', conference: 'booktitle', chapter: 'booktitle', book: 'publisher', thesis: 'school', report: 'institution', patent: 'howpublished', other: 'howpublished' }
const bibEscape = (s: string) => oneLine(s).replace(/\\/g, '\\textbackslash{}').replace(/[{}&%_$#]/g, (c) => `\\${c}`)
const bibName = (n: string) => (/,|\sand\s/i.test(n) ? `{${bibEscape(n)}}` : bibEscape(n))
const ascii = (s: string) => s.normalize('NFKD').replace(/[^A-Za-z0-9]/g, '')

export function toBibtex(works: readonly StoredWork[]): string {
  const used = new Map<string, number>()
  return sorted(works)
    .map((w) => {
      const last = ascii(oneLine(w.authors[0] ?? '').split(' ').pop() ?? '') || 'work'
      const base = `${last}${w.year}`
      const n = used.get(base) ?? 0
      used.set(base, n + 1)
      const key = n === 0 ? base : `${base}${String.fromCharCode(96 + Math.min(n, 26))}`
      const lines = [`  author = {${w.authors.map(bibName).join(' and ')}}`, `  title = {${bibEscape(w.title)}}`, `  year = {${w.year}}`]
      if (w.venue) lines.push(`  ${BIB_VENUE[w.workType]} = {${bibEscape(w.venue)}}`)
      if (w.doi) lines.push(`  doi = {${bibEscape(w.doi)}}`)
      if (w.url) lines.push(`  url = {${w.url.replace(/[{}\s]/g, '')}}`)
      if (w.workType === 'patent') lines.push('  note = {Patent}')
      return `@${BIB_TYPE[w.workType]}{${key},\n${lines.join(',\n')}\n}`
    })
    .join('\n\n')
    .concat(works.length ? '\n' : '')
}

// RIS
const RIS_TY: Record<WorkType, string> = { article: 'JOUR', conference: 'CPAPER', chapter: 'CHAP', book: 'BOOK', thesis: 'THES', patent: 'PAT', report: 'RPRT', other: 'GEN' }
const RIS_VENUE_TAG: Record<WorkType, string> = { article: 'JO', conference: 'T2', chapter: 'T2', book: 'PB', thesis: 'PB', patent: 'PB', report: 'PB', other: 'PB' }

export function toRis(works: readonly StoredWork[]): string {
  return sorted(works)
    .map((w) => {
      const l = [`TY  - ${RIS_TY[w.workType]}`, `TI  - ${oneLine(w.title)}`, ...w.authors.map((a) => `AU  - ${oneLine(a)}`), `PY  - ${w.year}`]
      if (w.venue) l.push(`${RIS_VENUE_TAG[w.workType]}  - ${oneLine(w.venue)}`)
      if (w.doi) l.push(`DO  - ${w.doi}`)
      if (w.url) l.push(`UR  - ${w.url}`)
      l.push('ER  - ')
      return l.join('\r\n')
    })
    .join('\r\n')
    .concat(works.length ? '\r\n' : '')
}

// CSV
const csvCell = (v: string) => {
  const t = oneLine(v)
  const safe = /^[=+\-@\t\r]/.test(t) ? `'${t}` : t
  return `"${safe.replace(/"/g, '""')}"`
}

export function toCsv(works: readonly StoredWork[]): string {
  const head = ['type', 'title', 'authors', 'year', 'venue', 'doi', 'url', 'featured', 'visibility']
  const rows = sorted(works).map((w) => [w.workType, w.title, w.authors.join('; '), String(w.year), w.venue, w.doi, w.url, w.featured ? 'yes' : 'no', w.isPublic ? 'public' : 'only me'].map(csvCell).join(','))
  return '\uFEFF' + [head.map(csvCell).join(','), ...rows].join('\r\n') + '\r\n'
}

// Plain reference list
export function toReferenceList(works: readonly StoredWork[]): string {
  return sorted(works)
    .map((w) => {
      const tail = w.doi ? ` https://doi.org/${w.doi}` : w.url ? ` ${w.url}` : ''
      return `${w.authors.map(oneLine).join(', ')} (${w.year}). ${oneLine(w.title)}.${w.venue ? ` ${oneLine(w.venue)}.` : ''}${tail}`
    })
    .join('\n\n')
    .concat(works.length ? '\n' : '')
}

export function exportWorks(works: readonly StoredWork[], format: ExportFormat): ExportFile {
  switch (format) {
    case 'bibtex':
      return { filename: 'publications.bib', mime: 'application/x-bibtex', text: toBibtex(works) }
    case 'ris':
      return { filename: 'publications.ris', mime: 'application/x-research-info-systems', text: toRis(works) }
    case 'csv':
      return { filename: 'publications.csv', mime: 'text/csv', text: toCsv(works) }
    case 'text':
      return { filename: 'publications.txt', mime: 'text/plain', text: toReferenceList(works) }
  }
}
