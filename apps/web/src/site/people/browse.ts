/* Pure helpers the directory's browser (a client component) shares with the server side. Nothing here imports the CMS or any
   server-only module, so it is safe in the browser bundle. */
import type { PersonCard } from './shape'

export const PEOPLE_PATH = '/people'
export const personHref = (slug: string) => `${PEOPLE_PATH}/${encodeURIComponent(slug)}`

/* ---- the directory's search: by name only. The set is whitelisted so crawlers cannot make endless addresses (plan section 5) ---- */

export const MAX_QUERY_LENGTH = 60
export type Filters = { q: string }

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

/** `?q=`: a name, spaces collapsed, at most 60 characters. Nothing else is read from the address. */
export function parseFilters(search: Record<string, string | string[] | undefined>): Filters {
  return { q: (one(search.q) ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_QUERY_LENGTH) }
}

const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()

/** People whose name contains every word typed, in any order, accents and case ignored. Titles (Dr, Prof) are part of the name. */
export function filterPeople(all: PersonCard[], f: Filters): PersonCard[] {
  const words = fold(f.q).split(' ').filter(Boolean)
  if (!words.length) return all
  return all.filter((p) => {
    const hay = fold(p.name)
    return words.every((w) => hay.includes(w))
  })
}

export const NO_DEPARTMENT = { id: 'none', label: 'Other' }

/** One of three brand tones for a picture slot, the same for the same person every time. */
export function toneOf(slug: string): 0 | 1 | 2 {
  let h = 0
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return (h % 3) as 0 | 1 | 2
}

/** Two letters for the picture slot while there is no photo. Titles (Dr, Prof, Mr...) are left out. */
export const initialsOf = (name: string) =>
  name
    .replace(/\b(dr|prof|professor|mr|ms|mrs)\.?\s/gi, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => Array.from(w)[0]?.toUpperCase() ?? '')
    .join('')
