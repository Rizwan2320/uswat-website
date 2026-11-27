import { describe, expect, it } from 'vitest'

import { LIMITS, isWorkId, isWorkType, normaliseDoi, normaliseUrl, splitAuthors, titleKey, validateCandidate, validateWorkInput } from '../../../src/modules/portal/publications/rules'
import { SAMPLE_WORKS } from '../../../src/modules/portal/publications/sampleSource'

const NOW = Date.UTC(2026, 10, 18)
const good = (over: Record<string, unknown> = {}) => ({ title: 'A title', year: 2020, venue: 'A journal', doi: '', authors: ['A. Person'], ...over })

describe('normaliseDoi', () => {
  it('lower-cases and removes the resolver prefix and doi: label', () => {
    expect(normaliseDoi('10.5555/ABC.1')).toBe('10.5555/abc.1')
    expect(normaliseDoi('https://doi.org/10.5555/ABC.1')).toBe('10.5555/abc.1')
    expect(normaliseDoi('http://dx.doi.org/10.5555/abc.1')).toBe('10.5555/abc.1')
    expect(normaliseDoi('doi: 10.5555/abc.1')).toBe('10.5555/abc.1')
  })
  it('refuses empty, malformed and over-long values', () => {
    for (const bad of ['', '  ', 'abc', '10.5/short', 'https://example.org/10.5555/x', '10.5555/' + 'a'.repeat(LIMITS.doi)]) expect(normaliseDoi(bad), bad).toBeNull()
  })
})

describe('titleKey', () => {
  it('ignores case, punctuation, accents and spacing, and includes the year', () => {
    expect(titleKey('Laser  Cooling: a Lab!', 2021)).toBe(titleKey('laser cooling — a lab', 2021))
    expect(titleKey('Café physics', 2020)).toBe(titleKey('Cafe Physics', 2020))
    expect(titleKey('Naïve résumé results', 2020)).toBe(titleKey('Naive resume results', 2020))
    expect(titleKey('Same title', 2020)).not.toBe(titleKey('Same title', 2021))
  })
  it('keeps Urdu letters so two different Urdu titles do not collapse into one empty key', () => {
    const a = titleKey('نمونہ مقالہ ایک', 2023)
    const b = titleKey('نمونہ مقالہ دو', 2023)
    expect(a).not.toBe(b)
    expect(a.startsWith('|')).toBe(false)
  })
})

describe('validateCandidate', () => {
  it('accepts a good record and cleans text', () => {
    expect(validateCandidate(good({ title: '  A\u0000  title  ', doi: 'https://doi.org/10.5555/X.1' }), NOW)).toEqual({ title: 'A title', year: 2020, venue: 'A journal', doi: '10.5555/x.1', authors: ['A. Person'], workType: 'article', url: '' })
  })
  it('drops records that are not objects or miss fields', () => {
    for (const bad of [null, 'x', 3, [], {}, good({ title: 5 }), good({ venue: null }), good({ authors: 'A' }), good({ doi: 5 })]) expect(validateCandidate(bad, NOW)).toBeNull()
  })
  it('drops empty or over-long titles, bad DOIs and bad years', () => {
    expect(validateCandidate(good({ title: ' ' }), NOW)).toBeNull()
    expect(validateCandidate(good({ title: 'x'.repeat(LIMITS.title + 1) }), NOW)).toBeNull()
    expect(validateCandidate(good({ doi: 'not a doi' }), NOW)).toBeNull()
    expect(validateCandidate(good({ year: 1899 }), NOW)).toBeNull()
    expect(validateCandidate(good({ year: 2028 }), NOW)).toBeNull()
    expect(validateCandidate(good({ year: 2027 }), NOW)).not.toBeNull()
    expect(validateCandidate(good({ year: 2020.5 }), NOW)).toBeNull()
  })
  it('limits authors and venue', () => {
    expect(validateCandidate(good({ authors: [] }), NOW)).toBeNull()
    expect(validateCandidate(good({ authors: Array.from({ length: LIMITS.authors + 1 }, () => 'A') }), NOW)).toBeNull()
    expect(validateCandidate(good({ authors: ['ok', 3] }), NOW)).toBeNull()
    expect(validateCandidate(good({ authors: ['x'.repeat(LIMITS.author + 1)] }), NOW)).toBeNull()
    expect(validateCandidate(good({ venue: 'v'.repeat(LIMITS.venue + 1) }), NOW)).toBeNull()
  })
})

describe('isWorkId', () => {
  it('accepts a uuid only', () => {
    expect(isWorkId('0b5e2b0e-6c47-4b0e-9a54-1f3a7c0c2d11')).toBe(true)
    for (const bad of ['', 'abc', '1', null, 5, "0b5e2b0e-6c47-4b0e-9a54-1f3a7c0c2d1'; drop table x;--"]) expect(isWorkId(bad)).toBe(false)
  })
})

describe('the sample list', () => {
  const valid = SAMPLE_WORKS.flatMap((w) => {
    const c = validateCandidate({ ...w, authors: [...w.authors] }, NOW)
    return c ? [c] : []
  })
  it('has the deliberate repeats and broken records it claims to have', () => {
    expect(valid.length).toBe(SAMPLE_WORKS.length - 2)
    const dois = valid.map((w) => w.doi).filter(Boolean)
    expect(new Set(dois).size).toBe(dois.length - 1) // one DOI written two ways
    const keys = valid.map((w) => titleKey(w.title, w.year))
    expect(new Set(keys).size).toBe(keys.length - 2) // the two DOI repeats and the no-DOI copy share title keys
  })
  it('uses only the reserved test DOI prefix, so none points at a real paper', () => {
    for (const w of valid) if (w.doi) expect(w.doi.startsWith('10.5555/')).toBe(true)
  })
})

describe('work type and link (FP-19)', () => {
  it('a record without a type is an article; a known type is kept; an unknown type drops the record', () => {
    expect(validateCandidate(good(), NOW)?.workType).toBe('article')
    expect(validateCandidate(good({ workType: 'chapter' }), NOW)?.workType).toBe('chapter')
    expect(validateCandidate(good({ workType: 'poster' }), NOW)).toBeNull()
    expect(validateCandidate(good({ workType: 3 }), NOW)).toBeNull()
    expect(isWorkType('thesis')).toBe(true)
    expect(isWorkType('Thesis')).toBe(false)
  })
  it('only http and https links survive; a bad link loses the link, not the record', () => {
    expect(normaliseUrl('https://example.invalid/a?b=1')).toBe('https://example.invalid/a?b=1')
    expect(normaliseUrl(' http://example.invalid ')).toBe('http://example.invalid/')
    for (const bad of ['', 'example.invalid', 'javascript:alert(1)', 'data:text/html,x', 'ftp://example.invalid/x', 'https://u:p@example.invalid/', 'https://exa mple.invalid/', 'https://', 'https://example.invalid/' + 'x'.repeat(LIMITS.url)]) expect(normaliseUrl(bad)).toBeNull()
    expect(validateCandidate(good({ url: 'javascript:alert(1)' }), NOW)).toMatchObject({ url: '' })
    expect(validateCandidate(good({ url: 'https://example.invalid/p' }), NOW)).toMatchObject({ url: 'https://example.invalid/p' })
  })
})

describe('splitAuthors and the add-a-work form', () => {
  const form = (over: Record<string, unknown> = {}) => ({ workType: 'article', title: 'A title', authors: 'A. Person; B. Other', year: '2021', venue: 'A journal', doi: '', url: '', ...over })
  it('splits on lines and semicolons and drops empties', () => {
    expect(splitAuthors('A. Person;\n B. Other ;; \n\n C. Third')).toEqual(['A. Person', 'B. Other', 'C. Third'])
    expect(splitAuthors('  ')).toEqual([])
  })
  it('accepts a good form and normalises the DOI and the link', () => {
    expect(validateWorkInput(form({ doi: 'https://doi.org/10.5555/X.2', url: 'https://example.invalid/x' }), NOW)).toEqual({ ok: true, work: { title: 'A title', year: 2021, venue: 'A journal', doi: '10.5555/x.2', authors: ['A. Person', 'B. Other'], workType: 'article', url: 'https://example.invalid/x' } })
  })
  it('names the first wrong field', () => {
    const f = (over: Record<string, unknown>) => (validateWorkInput(form(over), NOW) as { ok: false; field: string }).field
    expect(f({ workType: 'poster' })).toBe('type')
    expect(f({ title: '   ' })).toBe('title')
    expect(f({ title: 'x'.repeat(LIMITS.title + 1) })).toBe('title')
    expect(f({ authors: ' ; ' })).toBe('authors')
    expect(f({ authors: Array.from({ length: LIMITS.authors + 1 }, (_, i) => `A${i}`).join(';') })).toBe('authors')
    expect(f({ year: '20' })).toBe('year')
    expect(f({ year: '1899' })).toBe('year')
    expect(f({ year: '2028' })).toBe('year')
    expect(f({ year: 'abcd' })).toBe('year')
    expect(f({ venue: 'v'.repeat(LIMITS.venue + 1) })).toBe('venue')
    expect(f({ doi: 'not a doi' })).toBe('doi')
    expect(f({ url: 'javascript:alert(1)' })).toBe('url')
  })
  it('reports every wrong box, in screen order, not only the first', () => {
    expect(validateWorkInput(form({ title: '', authors: '', year: '20', doi: 'x', url: 'ftp://a' }), NOW)).toEqual({ ok: false, field: 'title', fields: ['title', 'authors', 'year', 'doi', 'url'] })
  })
  it('a missing or odd shape is refused, never thrown', () => {
    for (const bad of [null, undefined, 'x', 3, [], { title: 5 }]) expect(validateWorkInput(bad, NOW).ok).toBe(false)
  })
  it('allows an empty venue, DOI and link, and next year as a year (forthcoming)', () => {
    expect(validateWorkInput(form({ venue: '', year: '2027' }), NOW)).toMatchObject({ ok: true })
  })
})
