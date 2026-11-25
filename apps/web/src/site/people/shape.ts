import { RIGHTS_BLOCKING, type RightsStatus } from '@/governance/mediaRules'
import { safeHref } from '@/utilities/safeHref'

import { isSample, paragraphs, rel, str, type Doc } from '../organisation/shape'

import { samplePortraitOf } from './samplePortraits'

/* Pure side of the public people pages (plan section 5, route 9: `/people/` and `/people/{slug}/`). Nothing here opens the
   CMS, so unit tests can use it. Every personal detail arrives already filtered by the People field rules (an email or photo
   whose visibility is not Public is not in the record an anonymous reader gets); this file only decides how to draw what is left. */

export const PEOPLE_REVALIDATE_SECONDS = 300

export * from './browse'

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
    photo: photoOf(doc, name) ?? (isSample(doc) ? samplePortraitOf(slug, name) : null),
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
