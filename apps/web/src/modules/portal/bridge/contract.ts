/**
 * The one message the portal sends to the public site (docs/briefs/fp20-portal-public-bridge.md, ADR-0029).
 * Both sides import this file: the portal builds a message with `buildMessage`, the site accepts one only through `parseMessage`,
 * which is an allow-list with length limits. Nothing outside the list is ever read from the request.
 */
import { safeHref } from '@/utilities/safeHref'

import type { ProfileEdit } from '../profile/types'
import type { StoredWork } from '../publications/types'

export const BRIDGE_PATH = '/api/portal/publish'
export const MAX_PUBLISHED_WORKS = 200
export const LIMITS = { bio: 5000, title: 500, url: 2000, subject: 64 } as const

export type BridgeVisibility = 'hidden' | 'internal' | 'public'
export type BridgeMessage = {
  /** The People slug of this person; it is the account's `recordRef`. */
  subject: string
  approvedAt: string
  /** Null when nothing has been approved yet: the site then leaves the person's text, CV link and visibility as they are. */
  edit: { bio: { en: string; ur: string }; cvLink: string; visibility: { email: BridgeVisibility; photo: BridgeVisibility } } | null
  publications: { title: string; url: string }[]
}

const SUBJECT = /^[A-Za-z0-9_-]{1,64}$/
const VIS: readonly string[] = ['hidden', 'internal', 'public']

/** A work's public link: its full-text address, else the DOI address, else none (plain title). */
export function workLink(w: Pick<StoredWork, 'url' | 'doi'>): string {
  if (w.url) return /^https?:\/\//i.test(w.url) && safeHref(w.url) ? w.url : ''
  return w.doi ? `https://doi.org/${w.doi}` : ''
}

/** Claimed and Public works only, featured first (the list already comes featured first, then newest); capped. */
export function publicWorks(works: readonly StoredWork[]): { title: string; url: string }[] {
  const pub = works.filter((w) => w.status === 'claimed' && w.isPublic)
  const ordered = [...pub.filter((w) => w.featured), ...pub.filter((w) => !w.featured)]
  return ordered.slice(0, MAX_PUBLISHED_WORKS).map((w) => ({ title: w.title.slice(0, LIMITS.title), url: workLink(w).slice(0, LIMITS.url) }))
}

export function buildMessage(subject: string, edit: ProfileEdit | null, works: readonly StoredWork[], approvedAt: Date): BridgeMessage | null {
  if (!SUBJECT.test(subject)) return null
  return {
    subject,
    approvedAt: approvedAt.toISOString(),
    edit: edit
      ? { bio: { en: edit.bio.en, ur: edit.bio.ur }, cvLink: edit.cvLink, visibility: { email: edit.visibility.email, photo: edit.visibility.photo } }
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
  }
  if (!Array.isArray(raw.publications) || raw.publications.length > MAX_PUBLISHED_WORKS) return null
  const publications: { title: string; url: string }[] = []
  for (const p of raw.publications) {
    if (!isObj(p)) return null
    const title = text(p.title, LIMITS.title)
    const url = text(p.url, LIMITS.url)
    if (!title || !title.trim() || url === null) return null
    if (url && !/^https?:\/\//i.test(url)) return null
    if (url && !safeHref(url)) return null
    publications.push({ title: title.trim(), url })
  }
  return { subject, approvedAt, edit: parsedEdit, publications }
}
