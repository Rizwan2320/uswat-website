import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/office-of-the-deans/'

export const deans: OfficeProfile = {
  slug: 'office-of-the-deans',
  lists: ['administration'],
  group: 'Offices and boards',
  name: 'Office of the Deans',
  shortName: 'Deans',
  lead: 'The page that lists the deans’ offices: the Faculty of Chemical Sciences and the Faculty of Management and Social Sciences.',
  banner: officeBanner('office-of-the-deans', 'Office of the Deans. University of Swat.'),
  hero: officeHero('office-of-the-deans'),
  stats: [{ value: 2, label: 'faculties listed on the page' }],
  itemLists: [{ title: 'Faculties listed on the page', items: ['Faculty of Chemical Sciences', 'Faculty of Management and Social Sciences'], note: 'The Dean of the Faculty of Chemical Sciences has a page of his own, under Administration.' }],
  people: [],
  officialPage: PAGE,
  sources: [{ label: 'Office of the Deans page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The page lists the two faculty names only, with no deans, contacts or links in the copy that was read.',
    'The university’s dean-office, dean-office-2 and dean-office-4 pages hold only blank headings (news, announcements, events, tenders, jobs). They send visitors here.',
  ],
}
