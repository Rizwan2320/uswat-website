/**
 * Rules for the `home-content` global (slice 3z, docs/briefs/p3z-home-content-global.md): the home
 * page's photograph slider and statistics bar. Pure functions, no Payload imports at run time, so
 * every rule has a case table. The field validators and the publish hook are thin adapters.
 */

import type { DateFieldValidation, TextFieldSingleValidation } from 'payload'
import { date as baseDate, text } from 'payload/shared'

import { isSafeHref } from '../utilities/safeHref'
import { mediaPublishProblem } from './mediaRules'
import type { Actor } from './roles'

export const HOME_SLIDES = { min: 3, max: 8 } as const
export const HOME_STATS = { min: 3, max: 6 } as const
/** The icon names `site/content/hero.ts` and `types.ts` already use. */
export const SLIDE_ICONS = ['cap', 'document', 'book', 'calendar', 'people', 'badge'] as const
export const STAT_ICONS = ['cap', 'people', 'person', 'trophy'] as const

/** What the admin shows for each icon name (the names themselves are what the site reads). */
export const ICON_LABELS: Record<string, string> = {
  cap: 'Graduation cap',
  document: 'Document',
  book: 'Book',
  calendar: 'Calendar',
  people: 'People',
  person: 'Person',
  badge: 'Badge',
  trophy: 'Trophy',
}

/** Only these may publish; an editor saves drafts (same as Pages). The system (seeds) may too. */
export const HOME_PUBLISH_ROLES = ['platformAdmin', 'siteManager', 'approver'] as const
/** Who may change the global at all (draft saves). Contributors and auditors may not. */
export const HOME_EDIT_ROLES = [...HOME_PUBLISH_ROLES, 'editor'] as const

/** Who may read the home content before it is published (drafts). The public sees the published one. */
export const HOME_READ_ROLES = [...HOME_EDIT_ROLES, 'auditor'] as const

export function mayPublishHome(actor: Actor): boolean {
  if (actor.kind === 'system') return true
  return actor.kind === 'user' && (HOME_PUBLISH_ROLES as readonly string[]).includes(actor.role)
}

/**
 * A page on this site (`/...`, not `//host`) or an `https://` address. Stricter than the shared
 * safe-address rule on purpose: no `http:`, `mailto:`, `tel:` or in-page anchors on the home page.
 */
export function isHomeHref(value: unknown): boolean {
  if (typeof value !== 'string' || !isSafeHref(value)) return false
  const v = value.trim()
  if (v.startsWith('/')) return true
  try {
    const u = new URL(v)
    return u.protocol === 'https:' && u.hostname.length > 0
  } catch {
    return false
  }
}

export const homeHrefValidate: TextFieldSingleValidation = (value, options) => {
  const base = text(value, options)
  if (base !== true) return base
  if (value == null || value === '') return true
  return isHomeHref(value)
    ? true
    : 'Use a page on this site, starting with / (for example /academics), or a full address starting with https://'
}

const blank = (v: unknown): boolean => v == null || (typeof v === 'string' && v.trim() === '')

/** A statistic needs a source and a date unless it is ticked as a sample (repo rule 3). */
export const sourceUnlessSample: TextFieldSingleValidation = (value, options) => {
  const siblings = (options as { siblingData?: { sample?: unknown } }).siblingData
  if (siblings?.sample) return true
  return blank(value)
    ? 'Say where this figure comes from, or tick "This is a sample figure".'
    : text(value, options)
}
export const dateUnlessSample: DateFieldValidation = (value, options) => {
  const siblings = (options as { siblingData?: { sample?: unknown } }).siblingData
  if (siblings?.sample) return true
  return blank(value)
    ? 'Say when this figure was checked, or tick "This is a sample figure".'
    : baseDate(value, options)
}

export interface Problem {
  code: 'HOME_MEDIA_MISSING' | 'HOME_MEDIA_ALT' | 'HOME_MEDIA_RIGHTS'
  message: string
}

interface MediaLike {
  filename?: unknown
  alt?: unknown
  rightsStatus?: unknown
}

const idOf = (v: unknown): string | number | null => {
  if (v && typeof v === 'object' && 'id' in v) return (v as { id: string | number }).id
  return typeof v === 'string' || typeof v === 'number' ? v : null
}

/** The Media ids the slides point at, in slide order (null where a slide has no picture). */
export function slideImageIds(slides: unknown): Array<string | number | null> {
  return Array.isArray(slides) ? slides.map((s) => idOf((s as { image?: unknown })?.image)) : []
}

/**
 * Why a slide's picture cannot be on the live home page. `media` maps each id to its record, or
 * null when the record no longer exists. Same rule as every page (alt text, rights recorded).
 */
export function slideMediaProblems(
  ids: Array<string | number | null>,
  media: Map<string | number, MediaLike | null>,
): Problem[] {
  const out: Problem[] = []
  ids.forEach((id, i) => {
    const n = i + 1
    const m = id == null ? null : (media.get(id) ?? null)
    if (!m) {
      out.push({
        code: 'HOME_MEDIA_MISSING',
        message: `Slide ${n} has no picture, or its picture was deleted.`,
      })
      return
    }
    const problem = mediaPublishProblem(m)
    if (!problem) return
    const name = typeof m.filename === 'string' ? ` (${m.filename})` : ''
    out.push({
      code: problem.code === 'MEDIA_ALT_MISSING' ? 'HOME_MEDIA_ALT' : 'HOME_MEDIA_RIGHTS',
      message: `The picture on slide ${n}${name} ${problem.what}. Fix it in the Media library, then publish again.`,
    })
  })
  return out
}
