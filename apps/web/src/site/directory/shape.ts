import { safeHref } from '@/utilities/safeHref'

import { isSample, str, type Doc } from '../organisation/shape'

/* Pure side of the contact directory page (T7 directory): how a record becomes an entry and how entries are grouped. */

export const DIRECTORY_PATH = '/contact/directory'
export const DIRECTORY_REVALIDATE_SECONDS = 300

export type Phone = { text: string; href: string | null }
export type ContactEntry = {
  id: number | string
  section: string
  name: string
  hours: string | null
  phones: Phone[]
  email: string | null
  emailHref: string | null
  sample: boolean
}

/** `tel:` address from a number as typed: digits and a leading plus only. Null when nothing dialable is left. */
export function telHref(number: string): string | null {
  const plus = number.trim().startsWith('+') ? '+' : ''
  const digits = number.replace(/\D/g, '')
  return digits.length >= 3 ? safeHref(`tel:${plus}${digits}`) : null
}

/**
 * A Sample entry holds invented contacts, so its phone and email are plain text and never links:
 * nobody should be able to dial or write to an invented number or address by accident.
 */
export function toContactEntry(doc: Doc): ContactEntry | null {
  const name = str(doc.name)
  const section = str(doc.section)
  if (!name || !section) return null
  const sample = isSample(doc)
  const raw = Array.isArray(doc.phones) ? (doc.phones as Doc[]) : []
  const phones = raw.flatMap((p) => {
    const text = str(p?.number)
    return text ? [{ text, href: sample ? null : telHref(text) }] : []
  })
  const email = str(doc.email)
  return {
    id: doc.id,
    section,
    name,
    hours: str(doc.hours),
    phones,
    email,
    emailHref: email && !sample ? safeHref(`mailto:${email}`) : null,
    sample,
  }
}

const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true })

/** Sections in alphabetical order, entries in each by name. Two entries with the same name stay (the collection allows it). */
export function groupBySection(entries: ContactEntry[]): { section: string; id: string; entries: ContactEntry[] }[] {
  const map = new Map<string, ContactEntry[]>()
  for (const e of entries) map.set(e.section, [...(map.get(e.section) ?? []), e])
  return [...map.entries()]
    .sort(([a], [b]) => collator.compare(a, b))
    .map(([section, list], i) => ({ section, id: `s${i}`, entries: list.sort((a, b) => collator.compare(a.name, b.name)) }))
}
