import type { EventItem } from './types'

/* The public site's Events category (https://uswat.edu.pk/category/events/) holds recent happenings, not future
   dates, so there are no verified upcoming events yet. These two are recent items; NewsEvents labels the card
   "Recent Events" until an item has a `startISO` in the future. */
const V = '2026-11-06'
const U = 'https://uswat.edu.pk'

export const events: EventItem[] = [
  {
    id: 'cervical',
    title: 'Awareness seminar on cervical cancer prevention',
    venue: 'Theatre Hall, University of Swat',
    href: `${U}/2026/11/awareness-drive-on-cervical-cancer-preventions/`,
    month: '2026-11',
    source: `${U}/2026/11/awareness-drive-on-cervical-cancer-preventions/`,
    verifiedAt: V,
  },
  {
    id: 'kashmir',
    title: 'Kashmir Black Day seminar',
    venue: 'University of Swat',
    href: `${U}/2026/10/kashmir-black-day-youm-e-siah/`,
    month: '2026-10',
    source: `${U}/2026/10/kashmir-black-day-youm-e-siah/`,
    verifiedAt: V,
  },
]
