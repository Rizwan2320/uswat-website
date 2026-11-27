import { describe, expect, it } from 'vitest'

import { ACADEMIC_ICONS } from '../../src/collections/academics/pageFields'
import {
  departmentPageContent,
  programmePageContent,
} from '../../src/collections/academics/profileToCms'
import {
  KNOWN_ICONS,
  applyDepartmentContent,
  applyProgrammeContent,
  pictureOf,
} from '../../src/site/academics/cmsContent'
import { departmentProfiles, disciplineProfiles } from '../../src/site/academics/profiles'

const dcst = departmentProfiles.find((p) => p.slug === 'dcst')!
const cs = disciplineProfiles.find((p) => p.slug === 'bs-computer-science')!

describe('the CMS drives the rich pages (slice 3ar)', () => {
  it('knows exactly the icons the collection offers', () => {
    expect([...KNOWN_ICONS].sort()).toEqual([...ACADEMIC_ICONS].sort())
  })

  it.each(departmentProfiles.map((p) => [p.slug, p] as const))(
    'department %s: the profile seeded into the CMS and merged back is the same page',
    (_slug, profile) => {
      const doc = { id: 1, pageContent: departmentPageContent(profile) }
      expect(applyDepartmentContent(profile, doc)).toEqual(profile)
    },
  )

  it.each(disciplineProfiles.map((p) => [p.slug, p] as const))(
    'programme %s: the profile seeded into the CMS and merged back is the same page',
    (_slug, profile) => {
      const doc = { id: 1, pageContent: programmePageContent(profile) }
      expect(applyProgrammeContent(profile, doc)).toEqual(profile)
    },
  )

  it('an empty record changes nothing', () => {
    expect(applyDepartmentContent(dcst, { id: 1 })).toEqual(dcst)
    expect(applyDepartmentContent(dcst, { id: 1, pageContent: {} })).toEqual(dcst)
    expect(applyProgrammeContent(cs, { id: 1, pageContent: null })).toEqual(cs)
  })

  it('a filled section replaces the profile section and nothing else', () => {
    const doc = {
      id: 1,
      pageContent: {
        ...departmentPageContent(dcst),
        labs: [{ title: 'New lab', text: 'A lab the head added.', tools: ['Linux'] }],
      },
    }
    const out = applyDepartmentContent(dcst, doc)
    expect(out.labs.map((l) => l.title)).toEqual(['New lab'])
    expect(out.labs[0]!.art).toEqual(dcst.labs[0]!.art)
    expect(out.labs[0]!.tools).toEqual(['Linux'])
    expect({ ...out, labs: dcst.labs }).toEqual(dcst)
  })

  it('an emptied section falls back to the profile', () => {
    const doc = { id: 1, pageContent: { ...departmentPageContent(dcst), faq: [] } }
    expect(applyDepartmentContent(dcst, doc).faq).toEqual(dcst.faq)
  })

  it('skips rows that are half filled, and an icon it does not know becomes a safe one', () => {
    const doc = {
      id: 1,
      pageContent: {
        highlights: [
          { icon: 'code', title: 'Only a title', text: '   ' },
          { icon: 'not-an-icon', title: 'Both', text: 'Words' },
        ],
      },
    }
    expect(applyDepartmentContent(dcst, doc).highlights).toEqual([
      { icon: 'spark', title: 'Both', text: 'Words' },
    ])
  })

  it('a text field replaces the profile text, a blank one does not', () => {
    const doc = { id: 1, pageContent: { tagline: '  A new line.  ', intro: '   ' } }
    const out = applyDepartmentContent(dcst, doc)
    expect(out.tagline).toBe('A new line.')
    expect(out.intro).toBe(dcst.intro)
  })

  it('a programme curriculum is built from semester rows, in year order, with both terms', () => {
    const doc = {
      id: 1,
      pageContent: {
        curriculum: [
          { year: 2, term: '2', courses: ['B'] },
          { year: 1, term: '1', courses: ['A'] },
          { year: 9, term: '1', courses: ['ignored'] },
        ],
      },
    }
    const years = applyProgrammeContent(cs, doc).years
    expect(years).toEqual([
      { year: 1, semesters: [{ name: 'Semester 1', courses: ['A'] }, { name: 'Semester 2', courses: [] }] },
      { year: 2, semesters: [{ name: 'Semester 3', courses: [] }, { name: 'Semester 4', courses: ['B'] }] },
    ])
  })

  it('uses a Media record as a picture only when it has an address and a size', () => {
    expect(pictureOf({ url: '/m/a.webp', alt: 'A lab', width: 900, height: 600 })).toEqual({
      src: '/m/a.webp',
      alt: 'A lab',
      width: 900,
      height: 600,
    })
    expect(pictureOf(7)).toBeNull()
    expect(pictureOf({ url: '/m/a.webp' })).toBeNull()
    expect(pictureOf(null)).toBeNull()
  })

  it('the seeded text fits the collection limits, so the seed can be saved and published', () => {
    const longest = (xs: string[]) => Math.max(0, ...xs.map((x) => x.length))
    for (const p of departmentProfiles) {
      const c = departmentPageContent(p)
      expect(c.about.length, p.slug).toBeLessThanOrEqual(4)
      expect(longest(c.about.map((r) => r.text)), `${p.slug} about`).toBeLessThanOrEqual(900)
      expect(c.highlights.length).toBeLessThanOrEqual(6)
      expect(c.labs.length).toBeLessThanOrEqual(6)
      expect(c.researchAreas.length).toBeLessThanOrEqual(6)
      expect(c.careers.length).toBeLessThanOrEqual(8)
      expect(c.studentLife.length).toBeLessThanOrEqual(6)
      expect(c.faq.length).toBeLessThanOrEqual(12)
      expect(longest([c.intro]), `${p.slug} intro`).toBeLessThanOrEqual(300)
      expect(longest([c.tagline]), `${p.slug} tagline`).toBeLessThanOrEqual(140)
      for (const r of [...c.highlights, ...c.careers, ...c.studentLife, ...c.researchAreas]) {
        expect(r.title.length, `${p.slug} ${r.title}`).toBeLessThanOrEqual(80)
        expect(r.text.length, `${p.slug} ${r.title}`).toBeLessThanOrEqual(300)
      }
      for (const f of c.faq) {
        expect(f.question.length).toBeLessThanOrEqual(160)
        expect(f.answer.length, `${p.slug} ${f.question}`).toBeLessThanOrEqual(600)
      }
    }
    for (const p of disciplineProfiles) {
      const c = programmePageContent(p)
      expect(c.curriculum.length, p.slug).toBeLessThanOrEqual(12)
      expect(c.outcomes.length).toBeLessThanOrEqual(8)
      expect(c.skills.length).toBeLessThanOrEqual(6)
      for (const r of c.curriculum) expect(r.courses.length, p.slug).toBeLessThanOrEqual(8)
      expect(longest([c.summary]), `${p.slug} summary`).toBeLessThanOrEqual(240)
      expect(longest(c.about.map((r) => r.text))).toBeLessThanOrEqual(900)
      expect(longest(c.outcomes.map((r) => r.text)), `${p.slug} outcome`).toBeLessThanOrEqual(200)
    }
  })
})

describe('the seed never overwrites an edit (slice 3ar)', () => {
  it('fills only the sections the record has not got', async () => {
    const { missingSections } = await import('../../scripts/seed-page-content')
    const wanted = { tagline: 'T', labs: [{ title: 'L' }], faq: [{ question: 'q' }], intro: 'I' }
    expect(missingSections(undefined, wanted)).toEqual(wanted)
    expect(missingSections({ tagline: 'Mine', labs: [] }, wanted)).toEqual({
      labs: [{ title: 'L' }],
      faq: [{ question: 'q' }],
      intro: 'I',
    })
    expect(missingSections({ tagline: 'a', labs: [1], faq: [1], intro: 'b' }, wanted)).toEqual({})
  })
})
