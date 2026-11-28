/* The shape of a department or discipline profile: everything the rich T3 and T4 pages show that the CMS has no field for.
   Names, level, duration, head, people and e-mail still come from the CMS records. A profile is matched by slug.
   To add another department, copy profiles/dcst.ts, change the content, and register it in profiles/index.ts. */

import type { OfficePhone, Source } from '../offices/types'

export type IconName =
  | 'code'
  | 'layers'
  | 'network'
  | 'chart'
  | 'brain'
  | 'flask'
  | 'book'
  | 'briefcase'
  | 'users'
  | 'trophy'
  | 'spark'
  | 'shield'
  | 'cloud'
  | 'phone'
  | 'search'
  | 'rocket'
  | 'globe'
  | 'cap'
  | 'gear'
  | 'database'

export type Art = { src: string; alt: string; width: number; height: number }
export type Titled = { title: string; text: string }
export type IconTitled = Titled & { icon: IconName }
export type Faq = { q: string; a: string }

/** `draft` shows one quiet line at the foot of the page; set `reviewed` once the department has approved the text. */
export type ProfileStatus = 'draft' | 'reviewed'

export type Lab = Titled & { art: Art; tools: string[] }
export type ResearchArea = Titled & { icon: IconName; tags: string[] }

/** A person on the department page. Supplied by the owner; no e-mail or phone is shown.
    Photo: put a portrait (JPG, about 4:5) at `public/images/faculty/<id>.jpg` and set `photo` to that path; until then initials show. */
export type TeamMember = {
  id: string
  name: string
  title: string
  role: 'head' | 'coordinator' | 'member'
  /** The tag over the name. Defaults: "Head of Department (HoD)", "Coordinator", "Faculty". */
  roleLabel?: string
  /** Programme slugs this person coordinates. */
  coordinates?: string[]
  qualifications?: string[]
  photo?: string
}

/** Facts a department page takes from the university's own pages: each has its source address and the day it was read (CLAUDE.md rule 3). */
export type DepartmentReference = {
  sources: Source[]
  verifiedAt: string
  /** What the sources do not say: shown as "Still to be confirmed". */
  openPoints: string[]
  phones?: OfficePhone[]
  emails?: string[]
}

export type DepartmentProfile = {
  slug: string
  /** The page's address when it is not /academics/departments/<slug>. */
  path?: string
  status: ProfileStatus
  /** The page title when it is longer than `shortName`, for example "Faculty of Allied Health Sciences". */
  fullName?: string
  shortName: string
  tagline: string
  /** One or two sentences in the hero; keep it different from `about`. */
  intro: string
  hero: Art
  /** Pictures that rotate every seven seconds on the left of the banner band and fade into `banner`. */
  heroPhotos?: Art[]
  /** A photograph on the left of the hero card (the green card under the banner) that fades into its green. */
  campusPhoto?: Art
  /** Put the "News, events and notices" section first, above "About" (owner, 2026-11-28; DCST only so far). The section menu follows. */
  newsFirst?: boolean
  /** One hero for the whole top of the page, in place of the banner band, the green card and the statistics row: the title as text on the
      left, ONE photograph on the right that fades into the green (no rotation), two buttons, and the statistics in a strip that overlaps the
      bottom of the hero (with `campusPhoto` at its right end). Set for DCST only (owner, 2026-11-28). */
  heroBanner?: { photo: Art; pre: string; main: string; accent: string; line: string }
  /** The wide banner at the top of the page (1672 x 941, the title is in the picture, so `alt` is the page title and tagline). */
  banner: Art
  about: string[]
  /** Used when the CMS record has no vision or mission of its own. */
  vision: string
  mission: string
  highlights: IconTitled[]
  /** Programme slugs in the order they are shown. */
  disciplines: string[]
  /** The line over the programme cards. Default: the DCST wording. */
  programmesLede?: string
  /** Level and duration in the hero card and the stats strip. Defaults: BS, 4 years, eight semesters each. */
  levelText?: string
  durationText?: string
  durationNote?: string
  /** The picture in the About band when the head of department has no portrait yet. Default: the DCST chip. */
  tile?: Art
  /** Slugs of the alumni work shown on the department page (see alumni.ts). */
  alumni?: string[]
  /** The faculty band: its title and the line under it. Defaults: the DCST wording (head and programme coordinators). */
  peopleTitle?: string
  peopleLede?: string
  reference?: DepartmentReference
  labs: Lab[]
  research: ResearchArea[]
  careers: IconTitled[]
  studentLife: IconTitled[]
  faq: Faq[]
  /** The head of department first, then the programme coordinators. */
  team: TeamMember[]
}

export type Course = string
export type Semester = { name: string; courses: Course[] }
export type Year = { year: number; semesters: [Semester, Semester] }

export type DisciplineProfile = {
  slug: string
  department: string
  status: ProfileStatus
  /** The programme's full name, for lists built without a CMS record. Default: "BS <shortName>". */
  name?: string
  shortName: string
  /** The badge in the hero card. Default: "BS <shortName>". */
  badge?: string
  /** The centre or school that runs the programme, when the university's pages say. */
  centre?: string
  /** Who may apply, as the university's page words it. Shown when the CMS record has none. */
  eligibility?: string
  /** Level and duration for the hero card when the CMS record has none. Defaults: BS, 4 years. */
  level?: string
  duration?: string
  /** The line under "Curriculum by year". Default: the first year is shared with the department's other programmes. */
  curriculumLede?: string
  tagline: string
  /** One or two sentences for the card on the department page. */
  summary: string
  hero: Art
  /** The wide banner at the top of the page (1672 x 941, the title is in the picture, so `alt` is the page title and tagline). */
  banner: Art
  tile: Art
  /** The light picture beside the overview, so it differs from the hero. */
  figure: Art
  about: string[]
  whyStudy: IconTitled[]
  outcomes: string[]
  years: Year[]
  tracks: IconTitled[]
  skills: { group: string; items: string[] }[]
  careers: IconTitled[]
  faq: Faq[]
}
