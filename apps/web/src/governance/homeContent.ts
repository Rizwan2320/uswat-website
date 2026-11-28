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
export const HOME_PORTALS = { min: 3, max: 8 } as const
export const PORTAL_ICONS = ['book', 'badge', 'document', 'calendar', 'gear'] as const

/**
 * The slides may be left empty: the home page then keeps its standard photographs (site/home/homeMap.ts).
 * This lets the statistics be edited and published before any photograph can be uploaded (the hosted
 * Blob store is not set up yet, ADR-0014). Once there are slides, the 3 to 8 rule applies as before.
 * Like `minRows`, it runs on publish only; drafts may be incomplete.
 */
export const slidesCountValidate = (value: unknown): true | string => {
  const n = Array.isArray(value) ? value.length : 0
  if (n === 0) return true
  if (n < HOME_SLIDES.min || n > HOME_SLIDES.max) {
    return `Use ${HOME_SLIDES.min} to ${HOME_SLIDES.max} slides, or remove them all to keep the standard photographs.`
  }
  return true
}
/** Portal cards may be left empty (the standard cards stay); otherwise 3 to 8. Publish only, like the slides. */
export const portalsCountValidate = (value: unknown): true | string => {
  const n = Array.isArray(value) ? value.length : 0
  if (n === 0) return true
  return n < HOME_PORTALS.min || n > HOME_PORTALS.max
    ? `Use ${HOME_PORTALS.min} to ${HOME_PORTALS.max} cards, or remove them all to keep the standard cards.`
    : true
}
/** The header menu: 0 items keeps the standard menu, otherwise 3 to 12 (sub-links: up to 12 each). */
export const NAV_ITEMS = { min: 3, max: 12 } as const
export const NAV_CHILDREN = { max: 12 } as const
export const NAV_ICONS = [
  'cap', 'book', 'building', 'calendar', 'clipboard', 'document', 'download', 'flask', 'gavel', 'heart', 'laptop',
  'layers', 'megaphone', 'newspaper', 'palette', 'people', 'person', 'badge', 'trending', 'trophy', 'video', 'wallet',
] as const

export const navCountValidate = (value: unknown): true | string => {
  const n = Array.isArray(value) ? value.length : 0
  if (n === 0) return true
  return n < NAV_ITEMS.min || n > NAV_ITEMS.max
    ? `Use ${NAV_ITEMS.min} to ${NAV_ITEMS.max} menu items, or remove them all to keep the standard menu.`
    : true
}
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
  gear: 'Gear',
  building: 'Building',
  clipboard: 'Clipboard',
  download: 'Download',
  flask: 'Flask',
  gavel: 'Gavel',
  heart: 'Heart',
  laptop: 'Laptop',
  layers: 'Layers',
  megaphone: 'Megaphone',
  newspaper: 'Newspaper',
  palette: 'Palette',
  trending: 'Rising chart',
  video: 'Video',
  wallet: 'Wallet',
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

/**
 * A portal card link. Same as the other home links, but `http://` is allowed too: the university's own
 * examination system is served on http://exam.uswat.edu.pk/ (crawled 2026-11-06), and a stricter rule would
 * stop the whole card list from being saved.
 */
export const portalHrefValidate: TextFieldSingleValidation = (value, options) => {
  const base = text(value, options)
  if (base !== true) return base
  if (value == null || value === '') return true
  if (typeof value === 'string' && /^http:\/\/[^\s/]+/.test(value.trim()) && isSafeHref(value))
    return true
  return isHomeHref(value)
    ? true
    : 'Use a page on this site, starting with / (for example /academics), or a full address starting with https://'
}

/** A telephone number as people write it: starts with + or 0, then digits, spaces, dashes and brackets. */
export const phoneValidate: TextFieldSingleValidation = (value, options) => {
  const base = text(value, options)
  if (base !== true) return base
  if (value == null || value === '') return true
  return typeof value === 'string' && /^(\+|0)[\d\s\-()]{6,25}$/.test(value.trim())
    ? true
    : 'Write the number with digits only, starting with 0 or +, for example 0946-730510.'
}

/** Quick and useful links in the footer: up to 8 each. Empty keeps the standard links. */
export const FOOTER_LINKS = { max: 8 } as const

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

/** The Media id of the Vice Chancellor's photograph, or null when none is chosen (the standard photograph stays). */
export function leadershipPhotoId(leadership: unknown): string | number | null {
  return idOf((leadership as { photo?: unknown } | null | undefined)?.photo)
}

/** Why the Vice Chancellor's photograph cannot be on the live home page. Same rule as the slides. */
export function leadershipPhotoProblems(id: string | number | null, m: MediaLike | null): Problem[] {
  if (id == null) return []
  if (!m) {
    return [{ code: 'HOME_MEDIA_MISSING', message: 'The Vice Chancellor’s photograph was deleted from the Media library.' }]
  }
  const problem = mediaPublishProblem(m)
  if (!problem) return []
  const name = typeof m.filename === 'string' ? ` (${m.filename})` : ''
  return [
    {
      code: problem.code === 'MEDIA_ALT_MISSING' ? 'HOME_MEDIA_ALT' : 'HOME_MEDIA_RIGHTS',
      message: `The Vice Chancellor’s photograph${name} ${problem.what}. Fix it in the Media library, then publish again.`,
    },
  ]
}

/** A colour is empty (the standard one) or exactly #rrggbb. Runs for drafts too, so a typo is caught early. */
export const colourValidate = (value: unknown): true | string => {
  if (value == null || value === '') return true
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)
    ? true
    : 'Use a colour code like #003b17: a # and six digits or letters a to f.'
}
