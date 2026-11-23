import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/academic-calendar/'

export const calendar: OfficeProfile = {
  slug: 'academic-calendar',
  lists: [],
  path: '/academic-calendar',
  trail: [{ label: 'Academics', href: '/academics' }],
  group: 'Academic services',
  name: 'Academic Calendar',
  shortName: 'Academic Calendar',
  lead: 'The academic calendars the university has published for its programmes.',
  banner: officeBanner('academic-calendar', 'Academic Calendar. University of Swat.'),
  hero: officeHero('academic-calendar'),
  itemLists: [
    {
      title: 'Calendars the page lists',
      items: [
        '2024 Academic Calendar',
        'Revised Academic Calendar for A.D Program Semester-II & IV Spring 2023',
        'Tentative Academic Calendar (Fall 2023, Spring 2023), published on 04-07-2023',
      ],
      note: 'The calendars are PDF files on the university’s page; open that page for the files.',
    },
  ],
  people: [],
  officialPage: PAGE,
  sources: [{ label: 'Academic Calendar page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'When the page was read (6 November 2026) it listed three calendars and the newest was the 2024 Academic Calendar. No calendar for 2025 or 2026 was listed.',
    'The dates inside the calendars are not copied here, so that the university’s own files stay the one source.',
  ],
}
