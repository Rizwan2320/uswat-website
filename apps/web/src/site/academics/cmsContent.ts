/* Lets the CMS drive the rich department and programme pages (slice 3ar).
   A section the CMS has filled replaces the code profile's version of that section; an empty section falls back to the
   profile. So a page nobody has edited looks exactly as before, and a head or coordinator who fills a section changes it.
   Pure: no CMS access, so unit tests can use it. The fields are `departments.pageContent` and `programmes.pageContent`
   (src/collections/academics/pageFields.ts). */

import { safeHref } from '../../utilities/safeHref'
import { paragraphs as splitParagraphs, rel, str, type Doc } from '../organisation/shape'

import type { AlumniCard, AlumniKind } from './alumni'

import type {
  Art,
  DepartmentProfile,
  DisciplineProfile,
  Faq,
  IconName,
  IconTitled,
  Lab,
  ResearchArea,
  Semester,
  Year,
} from './types'

/** Keep equal to `IconName` and to ACADEMIC_ICONS in the collection (a unit test pins both). */
export const KNOWN_ICONS: readonly IconName[] = [
  'code',
  'layers',
  'network',
  'chart',
  'brain',
  'flask',
  'book',
  'briefcase',
  'users',
  'trophy',
  'spark',
  'shield',
  'cloud',
  'phone',
  'search',
  'rocket',
  'globe',
  'cap',
  'gear',
  'database',
]

type Row = Record<string, unknown>
const isRow = (v: unknown): v is Row => !!v && typeof v === 'object' && !Array.isArray(v)
const rows = (v: unknown): Row[] => (Array.isArray(v) ? v.filter(isRow) : [])
const group = (doc: Doc): Row => (isRow(doc.pageContent) ? doc.pageContent : {})
const words = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => str(x)).filter((x): x is string => x !== null) : []

/** A Media record as a picture. Pictures with no address, or no alt text, are not used: the profile's stay. */
export function pictureOf(v: unknown): Art | null {
  const m = rel(v)
  if (!m) return null
  const src = str(m.url)
  const width = typeof m.width === 'number' ? m.width : null
  const height = typeof m.height === 'number' ? m.height : null
  if (!src || !width || !height) return null
  return { src, alt: str(m.alt) ?? '', width, height }
}

const icon = (v: unknown, fallback: IconName): IconName =>
  KNOWN_ICONS.includes(v as IconName) ? (v as IconName) : fallback

function iconTitled(v: unknown): IconTitled[] {
  return rows(v).flatMap((r) => {
    const title = str(r.title)
    const text = str(r.text)
    return title && text ? [{ icon: icon(r.icon, 'spark'), title, text }] : []
  })
}

function faqOf(v: unknown): Faq[] {
  return rows(v).flatMap((r) => {
    const q = str(r.question)
    const a = str(r.answer)
    return q && a ? [{ q, a }] : []
  })
}

const paragraphList = (v: unknown): string[] =>
  rows(v).flatMap((r) => splitParagraphs(r.text))

const ALUMNI_KINDS: readonly AlumniKind[] = ['Thesis', 'Final-year project', 'Research paper']

/**
 * The alumni a head or coordinator wrote (slice 3at). A card needs a name, a year, a kind and a headline;
 * a row without them is left out. The link is used only when it is safe, and a photograph only when it has
 * an address and alt text (otherwise the card shows initials).
 */
export function alumniCardsOf(v: unknown): AlumniCard[] {
  return rows(v).flatMap((r, i) => {
    const name = str(r.name)
    const headline = str(r.headline)
    const kind = ALUMNI_KINDS.find((k) => k === r.kind)
    const classOf = typeof r.classOf === 'number' ? r.classOf : Number(r.classOf)
    if (!name || !headline || !kind || !Number.isInteger(classOf) || classOf < 1990 || classOf > 2100)
      return []
    const pic = pictureOf(r.photo)
    const href = safeHref(str(r.workUrl))
    return [
      {
        key: `cms-${str(r.id) ?? i}`,
        name,
        classOf,
        kind,
        headline,
        summary: str(r.summary),
        photo: pic && pic.alt ? { src: pic.src, alt: pic.alt } : null,
        href,
        external: href !== null && !href.startsWith('/'),
        sample: false,
      },
    ]
  })
}

/** `{ alumniCards }` when the CMS has alumni rows, else nothing, so a page nobody edited is unchanged. */
const alumniOf = (pc: Row, profile: { alumniCards?: AlumniCard[] }) => {
  const cards = alumniCardsOf(pc.alumni)
  return cards.length > 0 ? { alumniCards: cards } : profile.alumniCards ? { alumniCards: profile.alumniCards } : {}
}

/** The CMS list when it has rows, else the profile's. */
const pick = <T>(fromCms: T[], fromProfile: T[]): T[] => (fromCms.length > 0 ? fromCms : fromProfile)

export function applyDepartmentContent(profile: DepartmentProfile, doc: Doc): DepartmentProfile {
  const pc = group(doc)
  const labs: Lab[] = rows(pc.labs).flatMap((r, i) => {
    const title = str(r.title)
    const text = str(r.text)
    if (!title || !text) return []
    const art: Art = pictureOf(r.image) ?? profile.labs[i]?.art ?? profile.labs[0]?.art ?? profile.hero
    return [{ title, text, art, tools: words(r.tools) }]
  })
  const research: ResearchArea[] = rows(pc.researchAreas).flatMap((r) => {
    const title = str(r.title)
    const text = str(r.text)
    return title && text ? [{ icon: icon(r.icon, 'search'), title, text, tags: words(r.tags) }] : []
  })
  return {
    ...profile,
    shortName: str(pc.shortName) ?? profile.shortName,
    tagline: str(pc.tagline) ?? profile.tagline,
    intro: str(pc.intro) ?? profile.intro,
    hero: pictureOf(pc.heroImage) ?? profile.hero,
    campusPhoto: pictureOf(pc.campusPhoto) ?? profile.campusPhoto,
    about: pick(paragraphList(pc.about), profile.about),
    highlights: pick(iconTitled(pc.highlights), profile.highlights),
    labs: pick(labs, profile.labs),
    research: pick(research, profile.research),
    careers: pick(iconTitled(pc.careers), profile.careers),
    studentLife: pick(iconTitled(pc.studentLife), profile.studentLife),
    ...alumniOf(pc, profile),
    faq: pick(faqOf(pc.faq), profile.faq),
  }
}

function yearsOf(v: unknown): Year[] {
  const byYear = new Map<number, [Semester | null, Semester | null]>()
  for (const r of rows(v)) {
    const n = typeof r.year === 'number' ? r.year : Number(r.year)
    const term = str(r.term)
    if (!Number.isInteger(n) || n < 1 || n > 6 || (term !== '1' && term !== '2')) continue
    const slot = term === '1' ? 0 : 1
    const pair = byYear.get(n) ?? [null, null]
    pair[slot] = { name: `Semester ${2 * n - (slot === 0 ? 1 : 0)}`, courses: words(r.courses) }
    byYear.set(n, pair)
  }
  return [...byYear.entries()]
    .sort(([a], [b]) => a - b)
    .map(([n, [first, second]]) => ({
      year: n,
      semesters: [
        first ?? { name: `Semester ${2 * n - 1}`, courses: [] },
        second ?? { name: `Semester ${2 * n}`, courses: [] },
      ] as [Semester, Semester],
    }))
}

export function applyProgrammeContent(profile: DisciplineProfile, doc: Doc): DisciplineProfile {
  const pc = group(doc)
  const skills = rows(pc.skills).flatMap((r) => {
    const g = str(r.group)
    const items = words(r.items)
    return g && items.length > 0 ? [{ group: g, items }] : []
  })
  return {
    ...profile,
    shortName: str(pc.shortName) ?? profile.shortName,
    tagline: str(pc.tagline) ?? profile.tagline,
    summary: str(pc.summary) ?? profile.summary,
    hero: pictureOf(pc.heroImage) ?? profile.hero,
    tile: pictureOf(pc.tileImage) ?? profile.tile,
    figure: pictureOf(pc.figureImage) ?? profile.figure,
    about: pick(paragraphList(pc.about), profile.about),
    outcomes: pick(
      rows(pc.outcomes).flatMap((r) => str(r.text) ?? []),
      profile.outcomes,
    ),
    whyStudy: pick(iconTitled(pc.whyStudy), profile.whyStudy),
    tracks: pick(iconTitled(pc.tracks), profile.tracks),
    skills: pick(skills, profile.skills),
    years: pick(yearsOf(pc.curriculum), profile.years),
    careers: pick(iconTitled(pc.careers), profile.careers),
    ...alumniOf(pc, profile),
    faq: pick(faqOf(pc.faq), profile.faq),
  }
}
