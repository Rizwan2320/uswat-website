/* Pure helpers the directory's browser (a client component) shares with the server side. Nothing here imports the CMS or any
   server-only module, so it is safe in the browser bundle. */
import type { PersonCard } from './shape'

export const PEOPLE_PATH = '/people'
export const personHref = (slug: string) => `${PEOPLE_PATH}/${encodeURIComponent(slug)}`

/* ---- the directory's search: by name only. The set is whitelisted so crawlers cannot make endless addresses (plan section 5) ---- */

export const MAX_QUERY_LENGTH = 60
export type Filters = { q: string }

/* ---- the second way in: a department or a programme. A programme has no people of its own; its faculty are its department's ---- */

export type Area = { id: string; kind: 'department' | 'programme'; label: string; departmentSlug: string | null; departmentName: string | null }
const AREA_ID = /^[dp]:[a-z0-9][a-z0-9-]{0,118}$/

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

/** `?area=d:<slug>` or `?area=p:<slug>`: only an id of the right shape is read; the page then checks it against the real list. */
export function parseArea(search: Record<string, string | string[] | undefined>): string {
  const v = one(search.area) ?? ''
  return AREA_ID.test(v) ? v : ''
}

/** Departments and programmes whose name contains every word typed. Nothing typed lists them all, departments first. */
export function filterAreas(all: Area[], q: string): Area[] {
  const words = fold(q).split(' ').filter(Boolean)
  const hit = words.length ? all.filter((a) => words.every((w) => fold(a.label).includes(w))) : all
  return [...hit].sort((a, b) => (a.kind === b.kind ? a.label.localeCompare(b.label) : a.kind === 'department' ? -1 : 1))
}

export function peopleInArea(all: PersonCard[], area: Area): PersonCard[] {
  return area.departmentSlug ? all.filter((p) => p.departmentSlug === area.departmentSlug) : []
}
