import { RIGHTS_BLOCKING, type RightsStatus } from '@/governance/mediaRules'
import { safeHref } from '@/utilities/safeHref'

/* The picture at the top of a T5 article: what to draw, decided without Payload so it can be unit tested. */

export type Hero = { src: string; alt: string; width: number | null; height: number | null; credit: string | null }

type Doc = Record<string, unknown>
const text = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null)
const size = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.round(v) : null)

/**
 * `heroImage` arrives populated (depth 1). It is drawn only when the file has a safe address and the rights are
 * not blocking: an image with unknown rights must not show on a published page (media rules, CMS-06).
 * Empty alt text becomes a decorative picture (alt=""), never the file name.
 */
export function heroFigure(doc: Doc): Hero | null {
  const m = doc.heroImage
  if (!m || typeof m !== 'object') return null
  const media = m as Doc
  const src = safeHref(text(media.url) ?? undefined)
  // An image address is a site path or a web address; `mailto:`, `tel:` and anchors are valid links but not pictures.
  if (!src || !(src.startsWith('/') || src.startsWith('https://'))) return null
  const rights = text(media.rightsStatus)
  if (!rights || (RIGHTS_BLOCKING as readonly string[]).includes(rights as RightsStatus)) return null
  return { src, alt: text(media.alt) ?? '', width: size(media.width), height: size(media.height), credit: text(media.credit) }
}
