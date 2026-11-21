/* The shape of a department or discipline profile: everything the rich T3 and T4 pages show that the CMS has no field for.
   Names, level, duration, head, people and e-mail still come from the CMS records. A profile is matched by slug.
   To add another department, copy profiles/dcst.ts, change the content, and register it in profiles/index.ts. */

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

export type DepartmentProfile = {
  slug: string
  status: ProfileStatus
  shortName: string
  tagline: string
  /** One or two sentences in the hero; keep it different from `about`. */
  intro: string
  hero: Art
  about: string[]
  /** Used when the CMS record has no vision or mission of its own. */
  vision: string
  mission: string
  highlights: IconTitled[]
  /** Programme slugs in the order they are shown. */
  disciplines: string[]
  labs: Lab[]
  research: ResearchArea[]
  careers: IconTitled[]
  studentLife: IconTitled[]
  faq: Faq[]
  /** Where the department sits on campus, for the contact block. */
  location: string
  hours: string
  campusPhoto: Art
}

export type Course = string
export type Semester = { name: string; courses: Course[] }
export type Year = { year: number; semesters: [Semester, Semester] }

export type DisciplineProfile = {
  slug: string
  department: string
  status: ProfileStatus
  shortName: string
  tagline: string
  /** One or two sentences for the card on the department page. */
  summary: string
  hero: Art
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
