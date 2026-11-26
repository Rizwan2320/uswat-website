import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/office-365/'

export const office365: OfficeProfile = {
  slug: 'office-365',
  lists: ['administration'],
  group: 'Offices and boards',
  name: 'Office 365',
  shortName: 'Office 365',
  lead: 'The university’s Office 365 page lists three items: an introduction to Skype for Business, an installation guide and OneDrive.',
  banner: officeBanner('office-365', 'Office 365. University of Swat.'),
  hero: officeHero('office-365'),
  stats: [{ value: 3, label: 'items listed on the page' }],
  itemLists: [
    {
      title: 'Items listed on the Office 365 page',
      items: ['Introducing Skype for Business', '365 Installation Guide', 'OneDrive'],
      note: 'Titles only, as the university’s page names them. The documents are on the university’s page.',
    },
  ],
  people: [],
  officialPage: PAGE,
  sources: [{ label: 'Office 365 page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: ['The page is a list of three titles with no text, contact or instructions in the copy that was read.'],
}
