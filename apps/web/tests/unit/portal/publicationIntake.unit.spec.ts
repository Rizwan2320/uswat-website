import { describe, expect, it, vi } from 'vitest'

import { createCrossrefLookup, crossrefToRecord } from '../../../src/modules/portal/publications/crossref'
import { exportWorks, toBibtex, toCsv, toReferenceList, toRis } from '../../../src/modules/portal/publications/exporters'
import { ALLOWED_HOSTS, HTTP_LIMITS, getJson } from '../../../src/modules/portal/publications/http'
import { IMPORT_LIMITS, detectFormat, flipName, parseBibtex, parseCsv, parseImport, parseRis, readCsv } from '../../../src/modules/portal/publications/importers'
import { createOpenAlexSource, openAlexToRecord } from '../../../src/modules/portal/publications/openAlexSource'
import { validateCandidate } from '../../../src/modules/portal/publications/rules'
import { resolveLookup, resolveSource } from '../../../src/modules/portal/publications/sources'
import { mapWorkType } from '../../../src/modules/portal/publications/workTypes'
import type { StoredWork } from '../../../src/modules/portal/publications/types'

const NOW = Date.UTC(2026, 10, 27)
const valid = (r: unknown) => validateCandidate(r, NOW)

describe('work type names', () => {
  it('maps common names and sends the unknown to other', () => {
    expect(mapWorkType('inproceedings')).toBe('conference')
    expect(mapWorkType('Conference Paper')).toBe('conference')
    expect(mapWorkType('incollection')).toBe('chapter')
    expect(mapWorkType('book-chapter')).toBe('chapter')
    expect(mapWorkType('phdthesis')).toBe('thesis')
    expect(mapWorkType('techreport')).toBe('report')
    expect(mapWorkType('book')).toBe('book')
    expect(mapWorkType('Journal Article')).toBe('article')
    expect(mapWorkType('poster')).toBe('other')
  })
})

const BIB = `% a comment
@comment{ignored { with braces }}
@article{sample2022,
  author = {Sample, A. and Example, B. and others},
  title = {Optical fibres in {R}ural {N}etworks: a {\\"u}ber study \\& more},
  journal = "Journal of Sample Results",
  year = 2022,
  doi = {https://doi.org/10.5555/Sample.2022.001},
  url = {https://example.invalid/paper}
}
@inproceedings{conf1, author = {Other, D.}, title = {A conference paper}, booktitle = {Proceedings of the Sample Conference}, date = {2021-05-03}}
@misc{m1, author = {A. Person}, title = {Something else}, year = {2020}, howpublished = {Web}}
@book{b1, author = {{University Press Collective}}, title = {A Book}, publisher = {Sample Press}, year = {2019}}
@article{broken, title = {No year or author}}
`

describe('BibTeX import', () => {
  const { records, truncated } = parseBibtex(BIB)
  it('reads entries, skips comments, keeps types, flips names and cleans LaTeX', () => {
    expect(truncated).toBe(false)
    expect(records).toHaveLength(5)
    expect(records[0]).toMatchObject({ title: 'Optical fibres in Rural Networks: a über study & more', year: 2022, venue: 'Journal of Sample Results', workType: 'article', url: 'https://example.invalid/paper' })
    expect(records[0].authors).toEqual(['A. Sample', 'B. Example'])
    expect(records[1]).toMatchObject({ workType: 'conference', year: 2021, venue: 'Proceedings of the Sample Conference', authors: ['D. Other'] })
    expect(records[2].workType).toBe('other')
    expect(records[3]).toMatchObject({ workType: 'book', authors: ['University Press Collective'], venue: 'Sample Press' })
  })
  it('the record with no year is dropped by validation, the rest pass', () => {
    const v = records.map(valid)
    expect(v.filter(Boolean)).toHaveLength(4)
    expect(v[0]).toMatchObject({ doi: '10.5555/sample.2022.001', workType: 'article' })
    expect(v[4]).toBeNull()
  })
  it('handles joined values with # and a value in quotes with braces', () => {
    const r = parseBibtex('@article{k, author = {A. B}, title = "Joined " # {title {with} braces}, year = {2020}}').records[0]
    expect(r.title).toBe('Joined title with braces')
  })
  it('an unclosed entry stops the scan; garbage input gives no records', () => {
    expect(parseBibtex('@article{k, title = {open').records).toEqual([])
    expect(parseBibtex('no entries here @ @@ {}').records).toEqual([])
  })
  it('a hostile file is handled fast: 200 KB of open braces, and 50,000 unclosed entries', () => {
    const t0 = Date.now()
    parseBibtex('@a{' + '{'.repeat(IMPORT_LIMITS.chars))
    parseBibtex('@a{'.repeat(50_000))
    parseBibtex('@article{k, title = {' + 'x'.repeat(IMPORT_LIMITS.chars) + '}')
    expect(Date.now() - t0).toBeLessThan(1000)
  })
  it('stops at the record cap and says so', () => {
    const many = Array.from({ length: IMPORT_LIMITS.records + 20 }, (_, i) => `@article{k${i}, author={A. B}, title={T ${i}}, year={2020}}`).join('\n')
    const r = parseBibtex(many)
    expect(r.records).toHaveLength(IMPORT_LIMITS.records)
    expect(r.truncated).toBe(true)
  })
})

const RIS = `TY  - JOUR
TI  - Laser cooling in a teaching laboratory
AU  - Sample, A.
AU  - Example, B.
PY  - 2021/03/01/
JO  - Sample Physics Letters
DO  - 10.5555/sample.2021.014
UR  - https://example.invalid/laser
ER  - 

TY  - CHAP
T1  - A chapter
A1  - Other, D.
Y1  - 2019
T2  - A Book of Chapters
ER  - 
TY  - THES
TI  - A thesis
AU  - Student, S.
PY  - 2018
PB  - University of Sample
ER  - 
TY  - ZZZ
TI  - Unknown type
AU  - Q, Q
PY  - 2017
ER  - 
`

describe('RIS import', () => {
  const { records } = parseRis(RIS.replace(/\n/g, '\r\n'))
  it('reads each record with its type, flipped names, year and venue', () => {
    expect(records).toHaveLength(4)
    expect(records[0]).toMatchObject({ title: 'Laser cooling in a teaching laboratory', authors: ['A. Sample', 'B. Example'], year: 2021, venue: 'Sample Physics Letters', doi: '10.5555/sample.2021.014', workType: 'article', url: 'https://example.invalid/laser' })
    expect(records[1]).toMatchObject({ workType: 'chapter', venue: 'A Book of Chapters', year: 2019 })
    expect(records[2]).toMatchObject({ workType: 'thesis', venue: 'University of Sample' })
    expect(records[3].workType).toBe('other')
    expect(records.map(valid).every(Boolean)).toBe(true)
  })
  it('ignores lines outside a record and stops at the cap', () => {
    expect(parseRis('junk\nTI  - orphan\nER  - ').records).toEqual([])
    const many = Array.from({ length: IMPORT_LIMITS.records + 5 }, (_, i) => `TY  - JOUR\nTI  - T${i}\nAU  - A, B\nPY  - 2020\nER  - `).join('\n')
    expect(parseRis(many).records).toHaveLength(IMPORT_LIMITS.records)
  })
})

const CSV = `﻿Type,Title,Authors,Year,Venue,DOI,Link
Journal Article,"Quoted, title with ""marks""","Sample, A.; Example, B.",2022,Journal,10.5555/x1,https://example.invalid/x1
,Plain title,A. Person and B. Other,2021,,,
conference paper,"Multi
line",Solo Author,2020,Proc,,javascript:alert(1)
,No year,A. B,,,,
`

describe('CSV import', () => {
  const { records } = parseCsv(CSV)
  it('reads quoted cells, line breaks in cells, name lists and type text', () => {
    expect(records).toHaveLength(4)
    expect(records[0]).toMatchObject({ title: 'Quoted, title with "marks"', authors: ['A. Sample', 'B. Example'], year: 2022, workType: 'article', doi: '10.5555/x1' })
    expect(records[1]).toMatchObject({ authors: ['A. Person', 'B. Other'], workType: undefined })
    expect(records[2]).toMatchObject({ title: 'Multi line', workType: 'conference' })
  })
  it('a bad link loses the link; a missing year drops the record', () => {
    const v = records.map(valid)
    expect(v[2]).toMatchObject({ url: '' })
    expect(v[3]).toBeNull()
  })
  it('needs a title column', () => {
    expect(parseCsv('a,b\n1,2').records).toEqual([])
    expect(parseCsv('').records).toEqual([])
  })
  it('readCsv handles CRLF, doubled quotes and stops after the cap', () => {
    expect(readCsv('a,"b""c"\r\n1,2\r\n', 10)).toEqual([['a', 'b"c'], ['1', '2']])
    expect(readCsv('x\n'.repeat(1000), 5).length).toBeLessThanOrEqual(6)
  })
  it('a hostile file: 200 KB of quotes is read in well under a second', () => {
    const t0 = Date.now()
    parseCsv('title\n' + '"'.repeat(IMPORT_LIMITS.chars))
    expect(Date.now() - t0).toBeLessThan(1000)
  })
})

describe('parseImport', () => {
  it('detects the format from the name or from the content', () => {
    expect(detectFormat('x', 'my.BIB')).toBe('bibtex')
    expect(detectFormat('x', 'a.ris')).toBe('ris')
    expect(detectFormat('x', 'a.csv')).toBe('csv')
    expect(detectFormat('@article{a,}')).toBe('bibtex')
    expect(detectFormat('TY  - JOUR\nER  - ')).toBe('ris')
    expect(detectFormat('Title,Year\nA,2020')).toBe('csv')
    expect(detectFormat('hello world')).toBeNull()
  })
  it('refuses what it cannot read, a file that is too big, and a non-string', () => {
    expect(parseImport('hello world')).toEqual({ ok: false, error: 'format' })
    expect(parseImport('x'.repeat(IMPORT_LIMITS.chars + 1), 'a.bib')).toEqual({ ok: false, error: 'size' })
    expect(parseImport(42)).toEqual({ ok: false, error: 'format' })
    expect(parseImport('@article{a, title={t}}', 'a.bib')).toMatchObject({ ok: true, format: 'bibtex' })
  })
  it('flipName only flips one comma', () => {
    expect(flipName('Sample, A.')).toBe('A. Sample')
    expect(flipName('A. Sample')).toBe('A. Sample')
    expect(flipName('a, b, c')).toBe('a, b, c')
  })
})

const W = (over: Partial<StoredWork> = {}): StoredWork => ({ id: 'x', title: 'Optical fibres & {braces}', year: 2022, venue: 'Journal_of Sample', doi: '10.5555/x', authors: ['A. Sample', 'Other, B.'], status: 'claimed', duplicateOf: null, sample: false, workType: 'article', origin: 'manual', url: 'https://example.invalid/x', featured: false, isPublic: true, ...over })

describe('export', () => {
  it('BibTeX: escapes, keys are unique, types map', () => {
    const t = toBibtex([W(), W({ title: 'Second', doi: '' }), W({ title: 'Conf', workType: 'conference' })])
    // Same year, so the order is by title: Conf, Optical, Second.
    expect(t).toContain('@inproceedings{Sample2022,')
    expect(t).toContain('@article{Sample2022a,')
    expect(t).toContain('@article{Sample2022b,')
    expect(t).toContain('title = {Optical fibres \\& \\{braces\\}}')
    expect(t).toContain('journal = {Journal\\_of Sample}')
    expect(t).toContain('author = {A. Sample and {Other, B.}}')
    expect(t).toContain('doi = {10.5555/x}')
    expect(toBibtex([])).toBe('')
  })
  it('BibTeX output can be read back by our own importer', () => {
    const back = parseBibtex(toBibtex([W({ title: 'Plain title' }), W({ title: 'Book', workType: 'book', venue: 'Sample Press', year: 2010, doi: '' })]))
    expect(back.records.map((r) => [r.title, r.year, r.workType])).toEqual([['Plain title', 2022, 'article'], ['Book', 2010, 'book']])
  })
  it('RIS: one record per work, ends with ER, reads back', () => {
    const t = toRis([W({ title: 'One\nTwo' }), W({ title: 'Chap', workType: 'chapter', doi: '', year: 2000 })])
    expect(t).toContain('TY  - JOUR\r\nTI  - One Two')
    expect(t.match(/ER {2}- /g)).toHaveLength(2)
    expect(parseRis(t).records.map((r) => r.workType)).toEqual(['article', 'chapter'])
  })
  it('CSV: header, quotes doubled, a leading BOM, and spreadsheet formulas neutralised', () => {
    const t = toCsv([W({ title: '=HYPERLINK("http://evil.invalid","x")' }), W({ title: '+cmd|calc', doi: '' }), W({ title: '@SUM(1)', doi: '' }), W({ title: '-2+3', doi: '' }), W({ title: 'Say "hi"', doi: '' })])
    expect(t.startsWith('﻿"type","title"')).toBe(true)
    expect(t).toContain(`"'=HYPERLINK(""http://evil.invalid"",""x"")"`)
    expect(t).toContain(`"'+cmd|calc"`)
    expect(t).toContain(`"'@SUM(1)"`)
    expect(t).toContain(`"'-2+3"`)
    expect(t).toContain('"Say ""hi"""')
    expect(t.split('\r\n').filter(Boolean)).toHaveLength(6)
  })
  it('CSV carries the featured and visibility columns and reads back', () => {
    const t = toCsv([W({ featured: true, isPublic: false })])
    expect(t).toContain('"yes","only me"')
    expect(parseCsv(t).records[0]).toMatchObject({ title: 'Optical fibres & {braces}', year: 2022, workType: 'article' })
  })
  it('reference list: authors, year, title, venue, DOI link; featured first', () => {
    const t = toReferenceList([W({ title: 'Older', year: 2000 }), W({ title: 'Featured', year: 1990, featured: true, doi: '', url: 'https://example.invalid/f' })])
    expect(t.split('\n\n')[0]).toBe('A. Sample, Other, B. (1990). Featured. Journal_of Sample. https://example.invalid/f')
    expect(t).toContain('https://doi.org/10.5555/x')
  })
  it('exportWorks names the file and type; Urdu text survives in every format', () => {
    expect(exportWorks([W()], 'bibtex')).toMatchObject({ filename: 'publications.bib' })
    expect(exportWorks([W()], 'ris')).toMatchObject({ filename: 'publications.ris' })
    expect(exportWorks([W()], 'csv')).toMatchObject({ filename: 'publications.csv', mime: 'text/csv' })
    expect(exportWorks([W()], 'text')).toMatchObject({ filename: 'publications.txt' })
    const u = W({ title: 'نمونہ مقالہ', authors: ['اے نمونہ'], venue: 'نمونہ جریدہ' })
    for (const f of ['bibtex', 'ris', 'csv', 'text'] as const) expect(exportWorks([u], f).text).toContain('نمونہ مقالہ')
  })
})

// Fixtures below are written by hand from the documented answer shapes. They are NOT recorded responses. No real call was made.
const CROSSREF_OK = {
  status: 'ok',
  message: {
    DOI: '10.5555/sample.2022.001',
    type: 'journal-article',
    title: ['Optical <i>fibres</i> in rural networks &amp; more'],
    'container-title': ['Journal of Sample Results'],
    issued: { 'date-parts': [[2022, 3]] },
    author: [{ given: 'A.', family: 'Sample' }, { name: 'The Example Consortium' }, { family: 'Mononym' }],
    resource: { primary: { URL: 'https://example.invalid/landing' } },
  },
}
const reply = (body: unknown, init: { status?: number; headers?: Record<string, string> } = {}) =>
  ({ ok: (init.status ?? 200) < 400, status: init.status ?? 200, headers: new Headers(init.headers), text: async () => (typeof body === 'string' ? body : JSON.stringify(body)) }) as unknown as Response

describe('Crossref lookup (fixtures only; not run live)', () => {
  it('maps a journal article and the record validates', () => {
    const rec = crossrefToRecord(CROSSREF_OK.message)
    expect(valid(rec)).toEqual({ title: 'Optical fibres in rural networks & more', year: 2022, venue: 'Journal of Sample Results', doi: '10.5555/sample.2022.001', authors: ['A. Sample', 'The Example Consortium', 'Mononym'], workType: 'article', url: 'https://example.invalid/landing' })
  })
  it('maps other types, falls back to the event name, then the publisher, then editors', () => {
    expect(crossrefToRecord({ ...CROSSREF_OK.message, type: 'proceedings-article', 'container-title': [], event: { name: 'Sample Conference' } })).toMatchObject({ workType: 'conference', venue: 'Sample Conference' })
    expect(crossrefToRecord({ ...CROSSREF_OK.message, type: 'book', 'container-title': [], publisher: 'Sample Press', author: undefined, editor: [{ given: 'E.', family: 'Editor' }] })).toMatchObject({ workType: 'book', venue: 'Sample Press', authors: ['E. Editor'] })
    expect(crossrefToRecord({ ...CROSSREF_OK.message, type: 'component' })).toMatchObject({ workType: 'other' })
    expect(crossrefToRecord(null)).toBeNull()
  })
  it('asks the fixed host for the encoded DOI, refuses redirects, and passes a mailto only when it looks like an address', async () => {
    const f = vi.fn(async () => reply(CROSSREF_OK))
    const r = await createCrossrefLookup({ fetchImpl: f as unknown as typeof fetch, mailto: 'ops@example.invalid' })('https://doi.org/10.5555/Sample.2022.001')
    expect(r).toMatchObject({ ok: true })
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.crossref.org/works/10.5555%2Fsample.2022.001?mailto=ops%40example.invalid')
    expect(init.redirect).toBe('error')
    const f2 = vi.fn(async () => reply(CROSSREF_OK))
    await createCrossrefLookup({ fetchImpl: f2 as unknown as typeof fetch, mailto: 'not an address&x=1' })('10.5555/a')
    expect((f2.mock.calls[0] as unknown as [string])[0]).toBe('https://api.crossref.org/works/10.5555%2Fa')
  })
  it('a malformed DOI never reaches the network', async () => {
    const f = vi.fn()
    expect(await createCrossrefLookup({ fetchImpl: f as unknown as typeof fetch })('../../etc/passwd')).toEqual({ ok: false, error: 'notfound' })
    expect(f).not.toHaveBeenCalled()
  })
  it('404 is not found; 429, 500, a network error, a timeout, bad JSON and a missing message are source errors', async () => {
    const look = (fetchImpl: unknown, timeoutMs?: number) => createCrossrefLookup({ fetchImpl: fetchImpl as typeof fetch, timeoutMs })('10.5555/a')
    expect(await look(async () => reply('', { status: 404 }))).toEqual({ ok: false, error: 'notfound' })
    expect(await look(async () => reply('', { status: 429 }))).toEqual({ ok: false, error: 'source' })
    expect(await look(async () => reply('', { status: 500 }))).toEqual({ ok: false, error: 'source' })
    expect(await look(async () => { throw new TypeError('network') })).toEqual({ ok: false, error: 'source' })
    expect(await look(async () => reply('<html>'))).toEqual({ ok: false, error: 'source' })
    expect(await look(async () => reply({ status: 'ok' }))).toEqual({ ok: false, error: 'source' })
    expect(await look((_u: string, init: RequestInit) => new Promise((_res, rej) => init.signal!.addEventListener('abort', () => rej(new Error('aborted')))), 30)).toEqual({ ok: false, error: 'source' })
  })
})

describe('http guard', () => {
  it('only the two named hosts over https, no credentials, no port', async () => {
    const f = vi.fn(async () => reply({}))
    for (const bad of ['http://api.crossref.org/works/x', 'https://evil.invalid/works/x', 'https://api.crossref.org.evil.invalid/x', 'https://user:p@api.crossref.org/x', 'https://api.crossref.org:8443/x', 'not a url', 'https://127.0.0.1/']) expect(await getJson(bad, f as unknown as typeof fetch)).toEqual({ ok: false, status: null })
    expect(f).not.toHaveBeenCalled()
    expect(ALLOWED_HOSTS).toEqual(['api.crossref.org', 'api.openalex.org'])
  })
  it('refuses a body over the cap, by header or by length', async () => {
    expect(await getJson('https://api.crossref.org/x', (async () => reply('{}', { headers: { 'content-length': String(HTTP_LIMITS.bytes + 1) } })) as unknown as typeof fetch)).toEqual({ ok: false, status: null })
    expect(await getJson('https://api.crossref.org/x', (async () => reply('x'.repeat(HTTP_LIMITS.bytes + 1))) as unknown as typeof fetch)).toEqual({ ok: false, status: null })
  })
})

const OA_PAGE = (n: number, start = 0) => ({
  results: Array.from({ length: n }, (_, i) => ({
    title: `Work ${start + i}`,
    publication_year: 2020,
    doi: `https://doi.org/10.5555/oa.${start + i}`,
    type: 'article',
    primary_location: { source: { display_name: 'A Journal' } },
    authorships: [{ author: { display_name: 'A. Sample' } }],
    open_access: { oa_url: i === 0 ? 'https://example.invalid/oa' : null },
  })),
})

describe('OpenAlex source (fixtures only; not run live)', () => {
  it('maps a work, truncates a huge author list, and drops nothing it cannot judge (validation does that)', () => {
    const rec = openAlexToRecord({ ...OA_PAGE(1).results[0], authorships: Array.from({ length: 150 }, (_, i) => ({ author: { display_name: `Author ${i}` } })), type: 'book-chapter' }) as { authors: string[]; workType: string; url: string }
    expect(rec.authors).toHaveLength(100)
    expect(rec).toMatchObject({ workType: 'chapter', url: 'https://example.invalid/oa' })
    expect(openAlexToRecord(5)).toBeNull()
    expect(valid(openAlexToRecord({ title: null, publication_year: null }))).toBeNull()
  })
  it('builds the filter from the ORCID iD, pages until a short page, and marks the source as not a sample', async () => {
    const f = vi.fn(async (u: string) => reply(new URL(u).searchParams.get('page') === '1' ? OA_PAGE(100) : OA_PAGE(7, 100)))
    const src = createOpenAlexSource({ fetchImpl: f as unknown as typeof fetch })
    expect(src.sample).toBe(false)
    const out = await src.fetch('0000-0002-1825-0097')
    expect(out).toHaveLength(107)
    expect(f).toHaveBeenCalledTimes(2)
    const url = new URL((f.mock.calls[0] as unknown as [string])[0])
    expect(url.hostname).toBe('api.openalex.org')
    expect(url.searchParams.get('filter')).toBe('authorships.author.orcid:https://orcid.org/0000-0002-1825-0097')
    expect(out.map(valid).every(Boolean)).toBe(true)
  })
  it('stops at the page cap', async () => {
    const f = vi.fn(async () => reply(OA_PAGE(100)))
    expect(await createOpenAlexSource({ fetchImpl: f as unknown as typeof fetch, maxPages: 2 }).fetch('0000-0002-1825-009X')).toHaveLength(200)
    expect(f).toHaveBeenCalledTimes(2)
  })
  it('a bad ORCID shape never reaches the network; failures throw so the service reports a source error', async () => {
    const f = vi.fn(async () => reply({ nope: true }))
    const src = createOpenAlexSource({ fetchImpl: f as unknown as typeof fetch })
    await expect(src.fetch('0000-0002-1825-009')).rejects.toThrow()
    await expect(src.fetch('https://evil.invalid')).rejects.toThrow()
    expect(f).not.toHaveBeenCalled()
    await expect(src.fetch('0000-0002-1825-0097')).rejects.toThrow()
    await expect(createOpenAlexSource({ fetchImpl: (async () => reply('', { status: 503 })) as unknown as typeof fetch }).fetch('0000-0002-1825-0097')).rejects.toThrow()
  })
})

describe('which source and lookup the portal uses', () => {
  it('the sample list is the default; OpenAlex only by name; the DOI lookup is on unless turned off', () => {
    expect(resolveSource({}).sample).toBe(true)
    expect(resolveSource({ PORTAL_PUBLICATIONS_SOURCE: 'sample' }).sample).toBe(true)
    expect(resolveSource({ PORTAL_PUBLICATIONS_SOURCE: 'openalex' }).sample).toBe(false)
    expect(resolveLookup({})).toBeTypeOf('function')
    expect(resolveLookup({ PORTAL_DOI_LOOKUP: 'off' })).toBeNull()
  })
})
