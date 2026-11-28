/**
 * The one message the portal sends to the public site (docs/briefs/fp20-portal-public-bridge.md, ADR-0029).
 * Both sides import this file: the portal builds a message with `buildMessage`, the site accepts one only through `parseMessage`,
 * which is an allow-list with length limits. Nothing outside the list is ever read from the request.
 */
import { safeHref } from '@/utilities/safeHref'

import type { ProfileEdit } from '../profile/types'
import { orcidChecksumOk } from '../profile/rules'
import { WORK_TYPES, type StoredWork, type WorkType } from '../publications/types'

export const BRIDGE_PATH = '/api/portal/publish'
export const MAX_PUBLISHED_WORKS = 200
export const LIMITS = { bio: 5000, title: 500, url: 2000, subject: 64, interests: 15, interest: 60, office: 120, hours: 200, venue: 300 } as const

export type BridgeVisibility = 'hidden' | 'internal' | 'public'
export type BridgeWork = { title: string; url: string; year: number | null; venue: string; workType: WorkType; featured: boolean }
export type BridgeEdit = {
  bio: { en: string; ur: string }
  cvLink: string
  visibility: { email: BridgeVisibility; photo: BridgeVisibility }
  /** Stage 2. A message from an older portal build leaves these out, and the site then leaves the record's values alone. */
  researchInterests?: string[]
  officeLocation?: string
  officeHours?: string
  orcid?: string
  scholarUrl?: string
}
export type BridgeDeparture = 'former' | 'emeritus'
export const DEPARTURES: readonly BridgeDeparture[] = ['former', 'emeritus']
export type BridgeMessage = {
  /** The People slug of this person; it is the account's `recordRef`. */
  subject: string
  approvedAt: string
  /** Null when nothing has been approved yet: the site then leaves the person's text, CV link and visibility as they are. */
  edit: BridgeEdit | null
  publications: BridgeWork[]
  /** Set only once the Registrar has marked the person as left (FP-22). The site then shows a former or emeritus page without contact details. */
  departure?: BridgeDeparture
}

const SUBJECT = /^[A-Za-z0-9_-]{1,64}$/
const VIS: readonly string[] = ['hidden', 'internal', 'public']

/** A work's public link: its full-text address, else the DOI address, else none (plain title). */
export function workLink(w: Pick<StoredWork, 'url' | 'doi'>): string {
  if (w.url) return /^https?:\/\//i.test(w.url) && safeHref(w.url) ? w.url : ''
  return w.doi ? `https://doi.org/${w.doi}` : ''
}

/** Claimed and Public works only, featured first (the list already comes featured first, then newest); capped. */
export function publicWorks(works: readonly StoredWork[]): BridgeWork[] {
  const pub = works.filter((w) => w.status === 'claimed' && w.isPublic)
  const ordered = [...pub.filter((w) => w.featured), ...pub.filter((w) => !w.featured)]
  return ordered.slice(0, MAX_PUBLISHED_WORKS).map((w) => ({
    title: w.title.slice(0, LIMITS.title),
    url: workLink(w).slice(0, LIMITS.url),
    year: Number.isInteger(w.year) && w.year >= 1900 && w.year <= 2100 ? w.year : null,
    venue: (w.venue ?? '').slice(0, LIMITS.venue),
    workType: w.workType,
    featured: w.featured,
  }))
}

export function buildMessage(subject: string, edit: ProfileEdit | null, works: readonly StoredWork[], approvedAt: Date, departure: BridgeDeparture | null = null): BridgeMessage | null {
  if (!SUBJECT.test(subject)) return null
  return {
    subject,
    approvedAt: approvedAt.toISOString(),
    ...(departure ? { departure } : {}),
    // A departure carries no profile text: nothing the person wrote is republished after they have left.
    edit: edit && !departure
      ? {
          bio: { en: edit.bio.en, ur: edit.bio.ur },
          cvLink: edit.cvLink,
          visibility: { email: edit.visibility.email, photo: edit.visibility.photo },
          researchInterests: edit.researchInterests.slice(0, LIMITS.interests).map((t) => t.slice(0, LIMITS.interest)),
          officeLocation: edit.officeLocation.slice(0, LIMITS.office),
          officeHours: edit.officeHours.slice(0, LIMITS.hours),
          orcid: edit.orcid,
          scholarUrl: edit.scholarUrl,
        }
      : null,
    publications: publicWorks(works),
  }
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const text = (v: unknown, max: number): string | null => (typeof v === 'string' && v.length <= max ? v : null)

/** The site's side: returns a clean message or null. Unknown keys are dropped; wrong types or over-long text refuse the whole message. */
export function parseMessage(raw: unknown): BridgeMessage | null {
  if (!isObj(raw)) return null
  const subject = text(raw.subject, LIMITS.subject)
  const approvedAt = text(raw.approvedAt, 40)
  if (!subject || !SUBJECT.test(subject) || !approvedAt || Number.isNaN(Date.parse(approvedAt))) return null
  const edit = raw.edit
  let parsedEdit: BridgeMessage['edit'] = null
  if (edit !== null) {
    if (!isObj(edit) || !isObj(edit.bio) || !isObj(edit.visibility)) return null
    const en = text(edit.bio.en, LIMITS.bio)
    const ur = text(edit.bio.ur, LIMITS.bio)
    const cvLink = text(edit.cvLink, LIMITS.url)
    const email = typeof edit.visibility.email === 'string' && VIS.includes(edit.visibility.email) ? (edit.visibility.email as BridgeVisibility) : null
    const photo = typeof edit.visibility.photo === 'string' && VIS.includes(edit.visibility.photo) ? (edit.visibility.photo as BridgeVisibility) : null
    if (en === null || ur === null || cvLink === null || !email || !photo) return null
    if (cvLink && !safeHref(cvLink)) return null
    parsedEdit = { bio: { en, ur }, cvLink, visibility: { email, photo } }
    // Stage 2 keys: absent means "not sent"; present must be valid.
    if (edit.researchInterests !== undefined) {
      if (!Array.isArray(edit.researchInterests) || edit.researchInterests.length > LIMITS.interests) return null
      const list: string[] = []
      for (const t of edit.researchInterests) {
        const v = text(t, LIMITS.interest)
        if (v === null) return null
        if (v.trim()) list.push(v.trim())
      }
      parsedEdit.researchInterests = list
    }
    if (edit.officeLocation !== undefined) {
      const v = text(edit.officeLocation, LIMITS.office)
      if (v === null) return null
      parsedEdit.officeLocation = v.trim()
    }
    if (edit.officeHours !== undefined) {
      const v = text(edit.officeHours, LIMITS.hours)
      if (v === null) return null
      parsedEdit.officeHours = v.trim()
    }
    if (edit.orcid !== undefined) {
      const v = text(edit.orcid, 19)
      if (v === null || (v && !(/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(v) && orcidChecksumOk(v.replace(/-/g, ''))))) return null
      parsedEdit.orcid = v
    }
    if (edit.scholarUrl !== undefined) {
      const v = text(edit.scholarUrl, LIMITS.url)
      if (v === null || (v && !(/^https:\/\/scholar\.google\.[a-z.]+\//i.test(v) && safeHref(v)))) return null
      parsedEdit.scholarUrl = v
    }
  }
  if (!Array.isArray(raw.publications) || raw.publications.length > MAX_PUBLISHED_WORKS) return null
  const publications: BridgeWork[] = []
  for (const p of raw.publications) {
    if (!isObj(p)) return null
    const title = text(p.title, LIMITS.title)
    const url = text(p.url, LIMITS.url)
    if (!title || !title.trim() || url === null) return null
    if (url && !/^https?:\/\//i.test(url)) return null
    if (url && !safeHref(url)) return null
    // Stage 2 keys: an older portal build leaves them out.
    const venue = p.venue === undefined ? '' : text(p.venue, LIMITS.venue)
    const workType = p.workType === undefined ? 'other' : (WORK_TYPES as readonly unknown[]).includes(p.workType) ? (p.workType as WorkType) : null
    const year = p.year === undefined || p.year === null ? null : typeof p.year === 'number' && Number.isInteger(p.year) && p.year >= 1900 && p.year <= 2100 ? p.year : undefined
    const featured = p.featured === undefined ? false : typeof p.featured === 'boolean' ? p.featured : null
    if (venue === null || workType === null || year === undefined || featured === null) return null
    publications.push({ title: title.trim(), url, year, venue: venue.trim(), workType, featured })
  }
  let departure: BridgeDeparture | undefined
  if (raw.departure !== undefined && raw.departure !== null) {
    const d = DEPARTURES.find((x) => x === raw.departure)
    if (!d) return null
    departure = d
  }
  return { subject, approvedAt, edit: departure ? null : parsedEdit, publications, ...(departure ? { departure } : {}) }
}
