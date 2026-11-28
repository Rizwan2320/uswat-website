/* The shape of an office profile: what the rich Research and Administration pages show that the CMS Offices collection has no field for.
   Names, group, hours, phones and e-mails still come from the CMS office record when it has them. A profile is matched by the office slug,
   which is the slug in the route map (`/administration/{slug}`).
   Every fact here comes from a page of the university's own site and is listed in `sources` with the date it was read (rule 3).
   To add another office: copy a file in profiles/, change the content, register it in profiles/index.ts, add its two pictures
   (`node scripts/make-office-banners.mjs`, `node scripts/make-academic-art.mjs`) and a seed row. */
import type { Art, IconTitled } from '../academics/types'

export type OfficeArea = 'research' | 'administration'
export type OfficeGroup = 'Directorates' | 'Offices and boards' | 'Centres and associations' | 'Departments' | 'Academic services'

export type Source = { label: string; url: string }
export type OfficePerson = { id: string; name: string; title: string }
export type OfficePhone = { label?: string; number: string }
export type Milestone = {
  /** ISO date (YYYY-MM-DD) exactly as the university's page dates the item. */
  date: string
  title: string
}

export type OfficeProfile = {
  slug: string
  /** Pages that list this office: its own page is always `/administration/{slug}`. Empty for a page served at its own static address
      (see PAGE_PROFILES in profiles/index.ts): then `path` and `trail` say where it lives. */
  lists: OfficeArea[]
  /** The address of a static page (PAGE_PROFILES only). */
  path?: string
  /** Breadcrumb items between Home and the page, for a static page that is not under Research or Administration. */
  trail?: { label: string; href: string }[]
  /** A department or office statement shown as a card (vision, mission). Words as the source writes them. */
  statements?: { title: string; paragraphs: string[] }[]
  /** Plain lists with a heading (programmes, objectives, documents the university's page names). The items are titles, not links. */
  itemLists?: { title: string; items: string[]; note?: string }[]
  group: OfficeGroup
  name: string
  /** Shown in the hero badge and the breadcrumb. */
  shortName: string
  /** One sentence in the hero card, taken from the source. */
  lead: string
  banner: Art
  hero: Art
  /** Plain paragraphs from the source; leave empty when the source has no prose. */
  about?: string[]
  stats?: { value: string | number; label: string }[]
  servicesTitle?: string
  /** Small label above the services band; defaults to "What the office does". */
  servicesKicker?: string
  services?: IconTitled[]
  people: OfficePerson[]
  /** A quiet line under the people, for a conflict the university's own page has not resolved. */
  peopleNote?: string
  milestonesTitle?: string
  milestones?: Milestone[]
  address?: string
  phones?: OfficePhone[]
  emails?: string[]
  hours?: string
  /** Other places the office points to (portals and forms); each is opened as an outside link. */
  links?: { label: string; href: string }[]
  /** The office's own page on the university site. */
  /** Use the one-photograph hero (the department and programme pages' layout) instead of the banner, green card and statistics row. Opt-in; set on Affiliated Colleges (owner, 2026-11-28). */
  photoHero?: boolean
  officialPage: string
  sources: Source[]
  /** The day the sources were read (the register is `docs/plan/official-data-raw-2026-11-05.md`). */
  verifiedAt: string
  /** Facts the source states twice with different words; shown at the foot of the page. */
  openPoints?: string[]
}
