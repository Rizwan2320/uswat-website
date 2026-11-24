import { RIGHTS_BLOCKING, type RightsStatus } from '@/governance/mediaRules'
import { safeHref } from '@/utilities/safeHref'

import { byName, isSample, paragraphs, rel, str, type Doc } from '../organisation/shape'

/* Pure side of the public people pages (plan section 5, route 9: `/people/` and `/people/{slug}/`). Nothing here opens the
   CMS, so unit tests can use it. Every personal detail arrives already filtered by the People field rules (an email or photo
   whose visibility is not Public is not in the record an anonymous reader gets); this file only decides how to draw what is left. */

export const PEOPLE_PATH = '/people'
export const PEOPLE_REVALIDATE_SECONDS = 300
export const personHref = (slug: string) => `${PEOPLE_PATH}/${encodeURIComponent(slug)}`

export type PersonCard = {
  id: number | string
  slug: string
  name: string
  designation: string | null
  departmentSlug: string | null
  departmentName: string | null
  photo: { src: string; alt: string } | null
  sample: boolean
}

export type PersonProfile = PersonCard & {
  status: 'current' | 'former' | 'emeritus'
  about: string[]
  email: string | null
  emailHref: string | null
  cvHref: string | null
  publications: { key: string; title: string; href: string | null }[]
  office: string | null
}

const STATUSES = ['current', 'former', 'emeritus'] as const

/** A picture is drawn only with a safe address and rights that are not blocking (media rules); no alt text means decorative. */
export function photoOf(doc: Doc, name: string): { src: string; alt: string } | null {
  const m = rel(doc.photo)
  if (!m) return null
  const src = safeHref(str(m.url) ?? undefined)
  if (!src || !(src.startsWith('/') || src.startsWith('https://'))) return null
  const rights = str(m.rightsStatus)
  if (!rights || (RIGHTS_BLOCKING as readonly string[]).includes(rights as RightsStatus)) return null
  return { src, alt: str(m.alt) ?? name }
}

export function toPersonCard(doc: Doc): PersonCard | null {
  const name = str(doc.name)
  const slug = str(doc.slug)
  if (!name || !slug) return null
  const dept = rel(doc.department)
  return {
    id: doc.id,
    slug,
    name,
    designation: str(doc.designation),
    departmentSlug: str(dept?.slug),
    departmentName: str(dept?.name),
    photo: photoOf(doc, name),
    sample: isSample(doc),
  }
}

export function toPersonProfile(doc: Doc): PersonProfile | null {
  const card = toPersonCard(doc)
  if (!card) return null
  const status = STATUSES.find((s) => s === doc.facultyStatus) ?? 'current'
  const email = str(doc.email)
  const pubs = Array.isArray(doc.publications) ? (doc.publications as Doc[]) : []
  return {
    ...card,
    status,
    about: paragraphs(doc.details),
    email,
    // Invented addresses stay plain text: nobody should write to a Sample person by accident.
    emailHref: email && !card.sample ? safeHref(`mailto:${email}`) : null,
    cvHref: safeHref(str(doc.cvLink) ?? undefined),
    publications: pubs.flatMap((p, i) => {
      const title = str(p?.title)
      return title ? [{ key: String(p.id ?? i), title, href: safeHref(str(p.url) ?? undefined) }] : []
    }),
    office: str(rel(doc.office)?.name),
  }
}

/* ---- the directory's filters: the set is whitelisted so crawlers cannot make endless addresses (plan section 5) ---- */

export const MAX_QUERY_LENGTH = 60
export type Filters = { q: string; department: string | null }

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

/** `?q=` (a name, trimmed, at most 60 characters) and `?department=` (kept only when it names a department that has people). */
export function parseFilters(search: Record<string, string | string[] | undefined>, knownDepartments: string[]): Filters {
  const q = (one(search.q) ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_QUERY_LENGTH)
  const d = one(search.department) ?? ''
  return { q, department: knownDepartments.includes(d) ? d : null }
}

const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()

/** People whose name (or designation) contains every word typed, in any order, accents and case ignored; then the department. */
export function filterPeople(all: PersonCard[], f: Filters): PersonCard[] {
  const words = fold(f.q).split(' ').filter(Boolean)
  return all.filter((p) => {
    if (f.department && p.departmentSlug !== f.department) return false
    if (!words.length) return true
    const hay = fold(`${p.name} ${p.designation ?? ''}`)
    return words.every((w) => hay.includes(w))
  })
}

/** Departments that have at least one listed person, by name, for the filter menu. */
export function departmentsOf(all: PersonCard[]): { slug: string; name: string }[] {
  const seen = new Map<string, string>()
  for (const p of all) if (p.departmentSlug && p.departmentName) seen.set(p.departmentSlug, p.departmentName)
  return [...seen].map(([slug, name]) => ({ slug, name })).sort(byName)
}

export const NO_DEPARTMENT = { id: 'none', label: 'Other' }

/** Two letters for the picture slot while there is no photo. Titles (Dr, Prof, Mr...) are left out. */
export const initialsOf = (name: string) =>
  name
    .replace(/\b(dr|prof|professor|mr|ms|mrs)\.?\s/gi, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => Array.from(w)[0]?.toUpperCase() ?? '')
    .join('')
