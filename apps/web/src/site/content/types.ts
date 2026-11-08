/* Typed content shapes. Components read only these, through the async getters in lib/content.ts,
   so the editorial CMS can replace the data files later with no component changes. */

export type Link = { label: string; href: string; external?: boolean }
/** `icon` names an entry in components/navIcons.tsx (dropdown rows). */
export type NavItem = Link & { children?: (Link & { icon?: string })[] }

/** Where a fact came from. Real institutional facts need a source and a date; otherwise `sample: true`. */
export type Provenance = { source?: string; verifiedAt?: string; sample?: boolean }

export type Stat = Provenance & {
  id: string
  value: number
  suffix?: string
  label: string
  icon: 'cap' | 'people' | 'person' | 'trophy'
}

export type Portal = {
  id: string
  title: string
  description: string
  href: string
  icon: 'book' | 'badge' | 'document' | 'calendar' | 'gear'
}

/** Either a full date (`dateISO`, with the +05:00 offset) or only a month (`month: 'YYYY-MM'`) when the source gives no day. */
export type Dated = { dateISO?: string; month?: string }

export type FeedItem = Dated & Provenance & { id: string; title: string; href: string }
export type Feed = {
  id: 'notices' | 'jobs' | 'tenders'
  title: string
  viewAllHref: string
  items: FeedItem[]
}

export type SiteImage = { src: string; alt: string; width: number; height: number }

export type NewsItem = Dated &
  Provenance & {
    id: string
    title: string
    href: string
    image?: SiteImage
  }

export type EventItem = Dated &
  Provenance & {
    id: string
    title: string
    venue?: string
    href?: string
    /** Start of the event when it has a known day; used to split upcoming from past. */
    startISO?: string
  }
