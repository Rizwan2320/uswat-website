import type { EventItem } from './types'

/* The public site's Events category (https://uswat.edu.pk/category/events/) holds recent happenings, not future
   dates, so there are no verified upcoming events yet. These two are recent items; NewsEvents labels the card
   "Recent Events" until an item has a `startISO` in the future.
   The third item (Hunerkada) is worded from its address in the owner's route map (scripts/import/data/route_map.csv, class
   Events), not read from the page: no venue is given and the wording is to be confirmed against the post. The fourth item
   (human psychology) is handled the same way. */
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
  {
    id: 'hunerkada',
    title: 'Expansion of Hunerkada Institute at University of Swat',
    href: `${U}/2026/10/expansion-of-hunerkada-institute-at-university-of-swat/`,
    month: '2026-10',
    source: `${U}/2026/10/expansion-of-hunerkada-institute-at-university-of-swat/`,
    verifiedAt: V,
  },
  {
    id: 'psychology',
    title: 'The role of human psychology in shaping manners and personality',
    href: `${U}/2026/10/the-role-of-human-psychology-in-shaping-manners-and-personality/`,
    month: '2026-10',
    source: `${U}/2026/10/the-role-of-human-psychology-in-shaping-manners-and-personality/`,
    verifiedAt: V,
  },
]
