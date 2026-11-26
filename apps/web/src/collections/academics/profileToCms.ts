/**
 * The inverse of src/site/academics/cmsContent.ts (slice 3ar): the CMS `pageContent` a department or
 * programme record would hold so that its public page looks the same as the code profile's. Used to
 * start a head or coordinator from what is live instead of from an empty form. Text only: pictures in
 * a profile are files in `public/`, not Media uploads, so they are left out and the profile's stay.
 */
import type {
  DepartmentProfile,
  DisciplineProfile,
  IconTitled,
} from '../../site/academics/types'

const iconRows = (list: IconTitled[]) =>
  list.map(({ icon, title, text }) => ({ icon, title, text }))

export function departmentPageContent(p: DepartmentProfile) {
  return {
    shortName: p.shortName,
    tagline: p.tagline,
    intro: p.intro,
    about: p.about.map((text) => ({ text })),
    highlights: iconRows(p.highlights),
    labs: p.labs.map(({ title, text, tools }) => ({ title, text, tools })),
    researchAreas: p.research.map(({ icon, title, text, tags }) => ({ icon, title, text, tags })),
    careers: iconRows(p.careers),
    studentLife: iconRows(p.studentLife),
    faq: p.faq.map(({ q, a }) => ({ question: q, answer: a })),
  }
}

export function programmePageContent(p: DisciplineProfile) {
  return {
    shortName: p.shortName,
    tagline: p.tagline,
    summary: p.summary,
    about: p.about.map((text) => ({ text })),
    outcomes: p.outcomes.map((text) => ({ text })),
    whyStudy: iconRows(p.whyStudy),
    tracks: iconRows(p.tracks),
    skills: p.skills.map(({ group, items }) => ({ group, items })),
    curriculum: p.years.flatMap((y) =>
      y.semesters.map((s, i) => ({
        year: y.year,
        term: i === 0 ? ('1' as const) : ('2' as const),
        courses: s.courses,
      })),
    ),
    careers: iconRows(p.careers),
    faq: p.faq.map(({ q, a }) => ({ question: q, answer: a })),
  }
}
