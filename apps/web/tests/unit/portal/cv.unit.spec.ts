import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import CvDocument from '../../../src/modules/portal/cv/CvDocument'
import { buildCv, formatDate, isTemplate, TEMPLATES, type CvInput } from '../../../src/modules/portal/cv/build'
import { cvWordHtml } from '../../../src/modules/portal/cv/wordHtml'
import { EMPTY_EDIT } from '../../../src/modules/portal/profile/sampleStore'
import type { Profile } from '../../../src/modules/portal/profile/types'

const NOW = Date.UTC(2026, 10, 19, 23, 30) // late evening UTC on 19 November 2026
const profile = (over: Partial<Profile> = {}): Profile => ({
  name: { en: 'Dr Sample', ur: 'ڈاکٹر نمونہ' },
  designation: { en: 'Lecturer (sample)', ur: '' },
  department: 'Sample Department',
  facultyStatus: 'current',
  email: 'sample@example.invalid',
  ...EMPTY_EDIT,
  bio: { en: 'I teach optics.', ur: 'میں بصریات پڑھاتا ہوں۔' },
  researchInterests: ['optics', 'lasers'],
  officeLocation: 'Block B, room 4',
  officeHours: 'Mon 10-12',
  orcid: '0000-0002-1825-0097',
  scholarUrl: 'https://scholar.google.com/citations?user=abc',
  visibility: { email: 'hidden', photo: 'hidden' },
  sample: true,
  ...over,
})
const work = (title: string, year: number, status: 'claimed' | 'pending' = 'claimed') => ({ id: title, title, year, venue: 'Journal', doi: '', authors: ['A. Sample'], status, duplicateOf: null, sample: true })
const course = (code: string, season: 'Spring' | 'Summer' | 'Fall' | 'Winter', year: number) => ({ id: code + season + year, code, title: `Title ${code}`, season, year, programme: 'Prog', source: 'manual' as const })
const input = (over: Partial<CvInput> = {}): CvInput => ({ profile: profile(), claimedWorks: [work('Old', 2019), work('New', 2023)] as CvInput['claimedWorks'], courses: [course('A 1', 'Spring', 2026), course('B 2', 'Fall', 2026), course('C 3', 'Winter', 2025)], ...over })
const html = (i: CvInput, t: 'university' | 'hec' = 'university') => renderToStaticMarkup(createElement(CvDocument, { cv: buildCv(i, t, NOW) }))

describe('buildCv', () => {
  it('shows the email only when its visibility is Public', () => {
    for (const v of ['hidden', 'internal'] as const) expect(buildCv(input({ profile: profile({ visibility: { email: v, photo: 'hidden' } }) }), 'university', NOW).header.email).toBeNull()
    expect(buildCv(input({ profile: profile({ visibility: { email: 'public', photo: 'hidden' } }) }), 'university', NOW).header.email).toBe('sample@example.invalid')
    expect(html(input())).not.toContain('sample@example.invalid')
    expect(html(input({ profile: profile({ visibility: { email: 'public', photo: 'hidden' } }) }), 'hec')).toContain('sample@example.invalid')
  })
  it('lists publications newest first and courses newest semester first', () => {
    const cv = buildCv(input(), 'university', NOW)
    expect(cv.publications.map((p) => p.title)).toEqual(['New', 'Old'])
    expect(cv.courses.map((c) => c.semester)).toEqual(['Fall 2026', 'Spring 2026', 'Winter 2025'])
  })
  it('labels the date in UTC and in English', () => {
    expect(formatDate(NOW)).toBe('19 November 2026')
    expect(buildCv(input(), 'hec', NOW).generatedOn).toBe('19 November 2026')
    expect(html(input())).toContain('Generated on 19 November 2026.')
  })
  it('marks what is unverified: everything but the university-set header', () => {
    const cv = buildCv(input(), 'university', NOW)
    expect(cv.trust.header).toBe('university')
    expect(cv.trust.publications).toBe('claimed')
    expect(cv.trust.bio).toBe('self')
    expect(cv.unverified).toEqual(['bio', 'interests', 'contact', 'identifiers', 'publications', 'courses'])
    const h = html(input())
    expect(h).toContain('Entered by you. Not yet verified.')
    expect(h).toContain('Claimed by you. Not yet reviewed.')
    expect(h).toContain('Parts of this CV are not yet verified')
  })
  it('carries the sample flag from the data', () => {
    expect(html(input())).toContain('Sample CV')
    expect(html(input({ profile: profile({ sample: false }) }))).not.toContain('Sample CV')
  })
  it('says so when there are no publications or courses, and omits empty optional sections', () => {
    const h = html(input({ claimedWorks: [], courses: [], profile: profile({ researchInterests: [], bio: { en: '', ur: '' }, officeLocation: '', officeHours: '', orcid: '', scholarUrl: '' }) }))
    expect(h).toContain('No claimed publications yet.')
    expect(h).toContain('No courses listed yet.')
    expect(h).not.toContain('Research interests')
    expect(h).not.toContain('Contact and identifiers')
  })
})

describe('the two layouts', () => {
  it('carry the same facts', () => {
    for (const fact of ['Dr Sample', 'Sample Department', 'I teach optics.', 'optics', 'lasers', 'Block B, room 4', '0000-0002-1825-0097', 'New', 'Old', 'A 1', 'B 2', 'C 3']) {
      expect(html(input(), 'university'), fact).toContain(fact)
      expect(html(input(), 'hec'), fact).toContain(fact)
    }
  })
  it('differ in shape: the HEC-style layout has personal details and a numbered list and a table, and says it is not the official form', () => {
    const h = html(input(), 'hec')
    expect(h).toContain('Personal details')
    expect(h).toContain('<ol>')
    expect(h).toContain('<table')
    expect(h).toContain('not the official HEC form')
    const u = html(input(), 'university')
    expect(u).not.toContain('Personal details')
    expect(u).not.toContain('not the official HEC form')
  })
  it('only the listed layouts are accepted', () => {
    expect(TEMPLATES).toEqual(['university', 'hec'])
    for (const bad of ['', 'official', '../etc', null, undefined, 3]) expect(isTemplate(bad)).toBe(false)
    expect(isTemplate('hec')).toBe(true)
  })
})

describe('escaping and accessibility of the markup', () => {
  const hostile = '<script>alert(1)</script> "quoted" & <img src=x onerror=alert(1)>'
  it('escapes hostile text in every field that reaches the document', () => {
    const i = input({
      profile: profile({ bio: { en: hostile, ur: hostile }, researchInterests: [hostile], officeLocation: hostile, department: hostile }),
      claimedWorks: [work(hostile, 2022)] as CvInput['claimedWorks'],
      courses: [{ ...course('X 1', 'Fall', 2026), title: hostile, programme: hostile }],
    })
    for (const t of TEMPLATES) {
      const h = html(i, t)
      expect(h, t).not.toContain('<script')
      expect(h, t).not.toContain('<img')
      expect(h, t).toContain('&lt;script&gt;')
    }
    const word = cvWordHtml(buildCv(i, 'university', NOW))
    expect(word.match(/<script/g)).toBeNull()
    expect(word).not.toContain('<img')
  })
  it('keeps Urdu text and tags it lang=ur dir=rtl', () => {
    const h = html(input())
    expect(h).toContain('ڈاکٹر نمونہ')
    expect(h).toContain('lang="ur" dir="rtl"')
  })
  it('has one h1, labelled sections, and table headers with scope in the HEC-style layout', () => {
    const h = html(input(), 'hec')
    expect(h.match(/<h1/g)).toHaveLength(1)
    expect(h).toContain('aria-labelledby="cv-pubs"')
    expect(h).toContain('scope="col"')
    expect(h).toContain('scope="row"')
  })
})

describe('the Word file', () => {
  it('is a complete HTML document with the same content and an inline style', () => {
    const w = cvWordHtml(buildCv(input(), 'university', NOW))
    expect(w.startsWith('<!doctype html>')).toBe(true)
    expect(w).toContain('<meta charset="utf-8">')
    expect(w).toContain('<style>')
    expect(w).toContain('Dr Sample')
    expect(w).toContain('Generated on 19 November 2026.')
  })
})
