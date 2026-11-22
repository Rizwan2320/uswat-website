/**
 * Builds the CV from the portal's own records (FP-20). Pure: no I/O, no clock (the caller passes `now`), so every rule is tested.
 * - Email appears only when its visibility is Public (the same rule as the profile preview).
 * - Only CLAIMED publications appear; pending, rejected and duplicate ones never do.
 * - Each section says how far it can be trusted. In this build nothing is verified by a department editor (FP-03 is not built),
 *   so what the person typed is "self", publications are "claimed", and the fixed profile fields are "university" (sample seed).
 */
import type { Course } from '../courses/types'
import type { Profile } from '../profile/types'
import type { StoredWork } from '../publications/types'

export const TEMPLATES = ['university', 'hec'] as const
export type Template = (typeof TEMPLATES)[number]
export const isTemplate = (v: unknown): v is Template => typeof v === 'string' && (TEMPLATES as readonly string[]).includes(v)

/** university: set by the university (sample seed here); self: typed by the person, not yet verified; claimed: claimed by the person, not reviewed. */
export type Trust = 'university' | 'self' | 'claimed'

export type CvInput = { profile: Profile; claimedWorks: StoredWork[]; courses: Course[] }

export type Cv = {
  template: Template
  sample: boolean
  generatedOn: string
  header: { nameEn: string; nameUr: string; designation: string; department: string; email: string | null; photo: string | null }
  bio: { en: string; ur: string }
  interests: string[]
  contact: { officeLocation: string; officeHours: string }
  identifiers: { orcid: string; scholarUrl: string; cvLink: string }
  publications: Array<{ title: string; year: number; venue: string; doi: string; authors: string[] }>
  courses: Array<{ code: string; title: string; semester: string; programme: string }>
  /** Trust level of each block, so the document can label it. */
  trust: { header: Trust; bio: Trust; interests: Trust; contact: Trust; identifiers: Trust; publications: Trust; courses: Trust }
  /** Names of the blocks that are not yet verified (everything except the university-set header), for the cover note. */
  unverified: Array<'bio' | 'interests' | 'contact' | 'identifiers' | 'publications' | 'courses'>
}

const SEASON_ORDER: Record<string, number> = { Winter: 4, Fall: 3, Summer: 2, Spring: 1 }

/** "19 November 2026", always in UTC and English so the same instant gives the same text on every machine. */
export function formatDate(ms: number): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(ms))
}

export function buildCv(input: CvInput, template: Template, now: number): Cv {
  const p = input.profile
  const works = [...input.claimedWorks].sort((a, b) => b.year - a.year || a.title.localeCompare(b.title))
  const courses = [...input.courses].sort((a, b) => b.year - a.year || (SEASON_ORDER[b.season] ?? 0) - (SEASON_ORDER[a.season] ?? 0) || a.code.localeCompare(b.code))
  const cv: Cv = {
    template,
    sample: p.sample,
    generatedOn: formatDate(now),
    header: { nameEn: p.name.en, nameUr: p.name.ur, designation: p.designation.en, department: p.department, email: p.visibility.email === 'public' ? p.email : null, photo: p.photo ?? null },
    bio: p.bio,
    interests: p.researchInterests,
    contact: { officeLocation: p.officeLocation, officeHours: p.officeHours },
    identifiers: { orcid: p.orcid, scholarUrl: p.scholarUrl, cvLink: p.cvLink },
    publications: works.map((w) => ({ title: w.title, year: w.year, venue: w.venue, doi: w.doi, authors: w.authors })),
    courses: courses.map((c) => ({ code: c.code, title: c.title, semester: `${c.season} ${c.year}`, programme: c.programme })),
    trust: { header: 'university', bio: 'self', interests: 'self', contact: 'self', identifiers: 'self', publications: 'claimed', courses: 'self' },
    unverified: ['bio', 'interests', 'contact', 'identifiers', 'publications', 'courses'],
  }
  return cv
}
