/* The shape of a faculty profile and of the programme profiles of that faculty: what the rich faculty and programme pages show that the
   CMS has no field for. Names, level, duration, eligibility and links still come from the CMS records when they have them.
   A programme profile is matched by the programme slug, a faculty profile by its slug in the route `/faculties/{slug}`.
   Every fact here comes from a page of the university's own site and is listed in `sources` with the day it was read (CLAUDE.md rule 3).
   A fact the sources do not give is not written: it goes in `openPoints` (shown as "Still to be confirmed"). */
import type { Art } from '../academics/types'
import type { OfficePerson, OfficePhone, Source } from '../offices/types'

export type FacultyCentre = {
  /** Slug of the CMS department record for this centre, when one exists (then the card links to it). */
  slug?: string
  name: string
  /** Programme slugs the sources list under this centre. */
  programmes: string[]
}

export type FacultyProfile = {
  slug: string
  path: string
  name: string
  shortName: string
  lead: string
  banner: Art
  hero: Art
  about: string[]
  /** The faculty page gives one "Vision / Mission" text; it is shown whole under one heading. */
  visionMission: string[]
  stats: { value: string | number; label: string }[]
  centres: FacultyCentre[]
  /** Programme slugs in the order the faculty page lists them. */
  programmes: string[]
  people: OfficePerson[]
  peopleNote?: string
  /** A short factual paragraph about laboratories, with the page it comes from. */
  facilities?: { text: string; link: { label: string; href: string } }
  phones?: OfficePhone[]
  emails?: string[]
  officialPage: string
  sources: Source[]
  verifiedAt: string
  openPoints: string[]
}

export type ProgrammeListing = 'faculty-page' | 'qec-list'

export type FacultyProgramme = {
  slug: string
  faculty: string
  /** Full name as the university writes it. */
  name: string
  shortName: string
  /** The centre the sources put it under; absent when they do not say. */
  centre?: string
  banner: Art
  hero: Art
  summary: string
  about: string[]
  /** Which of the two sources list the programme. */
  listedOn: ProgrammeListing[]
  /** What this programme page cannot say yet. */
  openPoints: string[]
  sources: Source[]
  verifiedAt: string
}
