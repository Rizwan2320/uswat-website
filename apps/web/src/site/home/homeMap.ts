import type { HeroContent, HeroSlide } from '../content/hero'
import type { admissions as admissionsFile } from '../content/admissions'
import type { Portal, SiteImage, Stat } from '../content/types'
import type { HomeColours } from '../../governance/homePalette'
import { isSafeHref } from '../../utilities/safeHref'

/* Pure mapping from the published `home-content` global (the admin's "Home page content") to the shapes the
   home page reads. Nothing here opens the CMS, so unit tests can use it. A part that the global does not hold
   (fewer rows than the admin's minimum, or a picture that cannot be shown) falls back to the sourced files in
   content/*.ts, so an unfinished or empty global never leaves the page without its slider or its figures. */

type MediaLike = {
  url?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
  focalX?: number | null
  focalY?: number | null
}

type CtaDoc = {
  label?: string | null
  href?: string | null
  icon?: HeroSlide['primary']['icon'] | null
}

type LinkRow = { label?: string | null; href?: string | null }

export type HomeDoc = {
  topBar?: {
    place?: string | null
    established?: string | null
    studentUrl?: string | null
    facultyUrl?: string | null
  } | null
  footer?: {
    tagline?: string | null
    address?: string | null
    phone?: string | null
    phoneNote?: string | null
    email?: string | null
    facebook?: string | null
    youtube?: string | null
    linkedin?: string | null
    tiktok?: string | null
    mapUrl?: string | null
    quickLinks?: LinkRow[] | null
    usefulLinks?: LinkRow[] | null
  } | null
  hero?: {
    eyebrow?: string | null
    lineOne?: string | null
    lineTwo?: string | null
    lineThree?: string | null
    accent?: string | null
    sub?: string | null
  } | null
  leadership?: {
    photo?: number | MediaLike | null
    name?: string | null
    role?: string | null
    quote?: string | null
    paragraphs?: { text?: string | null }[] | null
    closing?: string | null
  } | null
  admissions?: {
    session?: string | null
    deadline?: string | null
    applyUrl?: string | null
    closedUrl?: string | null
    closedDetail?: string | null
    servicesHeading?: string | null
  } | null
  portals?:
    | {
        title?: string | null
        description?: string | null
        href?: string | null
        icon?: Portal['icon'] | null
      }[]
    | null
  colours?: HomeColours | null
  slides?:
    | { image?: number | MediaLike | null; primary?: CtaDoc | null; secondary?: CtaDoc | null }[]
    | null
  stats?:
    | {
        value?: number | null
        suffix?: string | null
        label?: string | null
        icon?: Stat['icon'] | null
        sample?: boolean | null
        source?: string | null
        verifiedAt?: string | null
      }[]
    | null
}

/** The same counts the admin enforces when the global is published (governance/homeContent.ts). */
export const MIN_SLIDES = 3
export const MIN_STATS = 3
export const MIN_PORTALS = 3

const isMedia = (m: unknown): m is MediaLike => typeof m === 'object' && m !== null

const toImage = (m: MediaLike | number | null | undefined): SiteImage | null => {
  if (!isMedia(m) || !m.url || !m.alt || !m.width || !m.height) return null
  const focus =
    typeof m.focalX === 'number' && typeof m.focalY === 'number'
      ? `${Math.round(m.focalX)}% ${Math.round(m.focalY)}%`
      : undefined
  return { src: m.url, alt: m.alt, width: m.width, height: m.height, ...(focus ? { focus } : {}) }
}

const toCta = (c: CtaDoc | null | undefined): HeroSlide['primary'] | null =>
  c && c.label && c.href
    ? { label: c.label, href: c.href, ...(c.icon ? { icon: c.icon } : {}) }
    : null

export function toHeroSlides(doc: HomeDoc | null | undefined, fallback: HeroSlide[]): HeroSlide[] {
  const slides: HeroSlide[] = []
  for (const row of doc?.slides ?? []) {
    const image = toImage(row.image)
    const primary = toCta(row.primary)
    const secondary = toCta(row.secondary)
    if (image && primary && secondary) slides.push({ image, primary, secondary })
  }
  return slides.length >= MIN_SLIDES ? slides : fallback
}

export function toStats(doc: HomeDoc | null | undefined, fallback: Stat[]): Stat[] {
  const stats: Stat[] = []
  for (const [i, row] of (doc?.stats ?? []).entries()) {
    if (typeof row.value !== 'number' || !row.label || !row.icon) continue
    stats.push({
      id: `home-stat-${i + 1}`,
      value: row.value,
      ...(row.suffix ? { suffix: row.suffix } : {}),
      label: row.label,
      icon: row.icon,
      ...(row.sample ? { sample: true } : {}),
      ...(row.source ? { source: row.source } : {}),
      ...(row.verifiedAt ? { verifiedAt: row.verifiedAt.slice(0, 10) } : {}),
    })
  }
  return stats.length >= MIN_STATS ? stats : fallback
}

const filled = (v: string | null | undefined): v is string =>
  typeof v === 'string' && v.trim() !== ''
/** A link the editor typed: used only when it is safe to put in an `href` (the admin checks it too, at publish). */
const safe = (v: string | null | undefined, fallback: string): string =>
  filled(v) && isSafeHref(v) ? v.trim() : fallback
const ICONS: readonly Portal['icon'][] = ['book', 'badge', 'document', 'calendar', 'gear']

export type AdmissionsData = {
  session: string
  deadlineISO: string
  applyUrl: string
  closedUrl: string
  closedDetail: string
  servicesHeading: string
  levels: readonly string[]
  servicesHref: string
}

/**
 * The admissions banner. Each field the editor filled replaces the sourced value; an empty field keeps it.
 * The last day is a calendar date; the banner stays open to the end of that day in Pakistan time. An editor
 * who clears the date does not keep the old one: the banner then shows Closed (an empty date means closed).
 */
export function toAdmissions(
  doc: HomeDoc | null | undefined,
  fallback: typeof admissionsFile,
): AdmissionsData {
  const a = doc?.admissions
  const day =
    typeof a?.deadline === 'string' && /^\d{4}-\d{2}-\d{2}/.test(a.deadline)
      ? a.deadline.slice(0, 10)
      : null
  const groupUsed = !!a && Object.values(a).some((v) => v != null && v !== '')
  return {
    session: filled(a?.session) ? a.session.trim() : fallback.session,
    deadlineISO: day
      ? `${day}T23:59:59+05:00`
      : groupUsed
        ? '1970-01-01T00:00:00+05:00'
        : fallback.deadlineISO,
    applyUrl: filled(a?.applyUrl) ? a.applyUrl.trim() : fallback.applyUrl,
    closedUrl: filled(a?.closedUrl) ? a.closedUrl.trim() : fallback.closedUrl,
    closedDetail: filled(a?.closedDetail) ? a.closedDetail.trim() : fallback.closedDetail,
    servicesHeading: filled(a?.servicesHeading)
      ? a.servicesHeading.trim()
      : fallback.servicesHeading,
    levels: fallback.levels,
    servicesHref: fallback.servicesHref,
  }
}

/** The portal cards: complete rows only; fewer than MIN_PORTALS usable rows keeps the sourced cards. */
export function toPortals(doc: HomeDoc | null | undefined, fallback: Portal[]): Portal[] {
  const out: Portal[] = []
  for (const row of doc?.portals ?? []) {
    if (
      filled(row.title) &&
      filled(row.description) &&
      filled(row.href) &&
      row.icon &&
      ICONS.includes(row.icon)
    ) {
      out.push({
        id: `home-portal-${out.length + 1}`,
        title: row.title.trim(),
        description: row.description.trim(),
        href: row.href.trim(),
        icon: row.icon,
      })
    }
  }
  return out.length >= MIN_PORTALS ? out : fallback
}

/**
 * The Vice Chancellor's message. Each field the editor filled replaces the sourced value; an empty one keeps it.
 * The full message is the filled paragraphs in order; with none, the sourced full message stays. Paragraphs the
 * editor wrote count as the complete message (the "read the rest on the university website" line is only for
 * a message that was cut short). The photograph is the uploaded one when it can be shown (a picture with its
 * address, alt text and size), and the sourced portrait otherwise.
 */
export function toLeadership<T extends LeadershipShape>(
  doc: HomeDoc | null | undefined,
  fallback: T,
  fallbackPhoto: SiteImage,
): T & { photo: SiteImage } {
  const l = doc?.leadership
  if (!l) return { ...fallback, photo: fallbackPhoto }
  const paragraphs = (l.paragraphs ?? [])
    .map((p) => (typeof p.text === 'string' ? p.text.trim() : ''))
    .filter((t) => t !== '')
  return {
    ...fallback,
    name: filled(l.name) ? l.name.trim() : fallback.name,
    role: filled(l.role) ? l.role.trim() : fallback.role,
    quote: filled(l.quote) ? l.quote.trim() : fallback.quote,
    fullMessage: paragraphs.length > 0 ? paragraphs : fallback.fullMessage,
    fullMessageComplete: paragraphs.length > 0 ? true : fallback.fullMessageComplete,
    closing: filled(l.closing) ? l.closing.trim() : fallback.closing,
    photo: toImage(l.photo) ?? fallbackPhoto,
  }
}

type LeadershipShape = {
  name: string
  role: string
  quote: string
  fullMessage: string[]
  fullMessageComplete: boolean
  closing: string
}

/**
 * The words beside the slider. Each field the editor filled replaces its part of the sourced headline; an empty
 * one keeps it. The third line carries the highlighted word, so a headline always has three lines.
 */
export function toHeroContent(doc: HomeDoc | null | undefined, fallback: HeroContent): HeroContent {
  const h = doc?.hero
  if (!h) return fallback
  const [one, two, three] = fallback.lines
  return {
    eyebrow: filled(h.eyebrow) ? h.eyebrow.trim() : fallback.eyebrow,
    lines: [
      filled(h.lineOne) ? { text: h.lineOne.trim() } : one!,
      filled(h.lineTwo) ? { text: h.lineTwo.trim() } : two!,
      filled(h.lineThree) || filled(h.accent)
        ? {
            text: filled(h.lineThree) ? h.lineThree.trim() : three!.text.trim(),
            accent: filled(h.accent) ? h.accent.trim() : three!.accent,
          }
        : three!,
    ],
    sub: filled(h.sub) ? h.sub.trim() : fallback.sub,
  }
}

export type TopBarData = { place: string; established: string; studentUrl: string; facultyUrl: string }

export type TopBarFallback = {
  place: string
  established: string
  studentUrl: string
  facultyUrl: string
}

/** The top bar. Each field the editor filled replaces the standard text or link; an empty one keeps it. */
export function toTopBar(doc: HomeDoc | null | undefined, fallback: TopBarFallback): TopBarData {
  const t = doc?.topBar
  return {
    place: filled(t?.place) ? t.place.trim() : fallback.place,
    established: filled(t?.established) ? t.established.trim() : fallback.established,
    studentUrl: safe(t?.studentUrl, fallback.studentUrl),
    facultyUrl: safe(t?.facultyUrl, fallback.facultyUrl),
  }
}

/**
 * The number to dial for a telephone written the way people write it: 0946-730510 gives +92946730510, a number
 * that starts with + keeps its country code, 00 becomes +. Anything else cannot be worked out: null.
 */
export function telHref(display: string): string | null {
  const d = display.trim().replace(/[^\d+]/g, '')
  if (d.startsWith('+') && d.length >= 8) return d
  if (d.startsWith('00') && d.length >= 9) return `+${d.slice(2)}`
  if (d.startsWith('0') && d.length >= 8) return `+92${d.slice(1)}`
  return null
}

type FooterLink = { label: string; href: string }
type SocialLink = { id: string; label: string; href: string }

export type FooterFallback = {
  tagline: string
  address: { footerLine: string; sample: boolean }
  phone: { display: string; tel: string; note: string }
  email: string
  social: readonly SocialLink[]
  mapHref: string
  quick: readonly FooterLink[]
  useful: readonly FooterLink[]
}

export type FooterData = {
  tagline: string
  addressLine: string
  addressSample: boolean
  phone: { display: string; tel: string; note: string }
  email: string
  social: SocialLink[]
  mapHref: string
  quick: FooterLink[]
  useful: FooterLink[]
}

const linkRows = (rows: LinkRow[] | null | undefined, fallback: readonly FooterLink[]): FooterLink[] => {
  const out: FooterLink[] = []
  for (const r of rows ?? []) {
    if (filled(r.label) && filled(r.href) && isSafeHref(r.href))
      out.push({ label: r.label.trim(), href: r.href.trim() })
  }
  return out.length > 0 ? out : [...fallback]
}

/**
 * The footer. Each field the editor filled replaces the standard text or link; an empty one keeps it. An address
 * the editor typed is the university's own and no longer carries the Sample tag. Link lists are complete rows only;
 * with none, the standard list stays.
 */
export function toFooter(doc: HomeDoc | null | undefined, fallback: FooterFallback): FooterData {
  const f = doc?.footer
  const display = filled(f?.phone) ? f.phone.trim() : fallback.phone.display
  const tel = filled(f?.phone) ? (telHref(f.phone) ?? fallback.phone.tel) : fallback.phone.tel
  const own: Record<string, string | null | undefined> = {
    facebook: f?.facebook,
    youtube: f?.youtube,
    linkedin: f?.linkedin,
    tiktok: f?.tiktok,
  }
  return {
    tagline: filled(f?.tagline) ? f.tagline.trim() : fallback.tagline,
    addressLine: filled(f?.address) ? f.address.trim() : fallback.address.footerLine,
    addressSample: filled(f?.address) ? false : fallback.address.sample,
    phone: { display, tel, note: filled(f?.phoneNote) ? f.phoneNote.trim() : fallback.phone.note },
    email: filled(f?.email) && /^[^\s@]+@[^\s@]+$/.test(f.email.trim()) ? f.email.trim() : fallback.email,
    social: fallback.social.map((s) => {
      const v = own[s.id]
      return { id: s.id, label: s.label, href: safe(v, s.href) }
    }),
    mapHref: safe(f?.mapUrl, fallback.mapHref),
    quick: linkRows(f?.quickLinks, fallback.quick),
    useful: linkRows(f?.usefulLinks, fallback.useful),
  }
}
