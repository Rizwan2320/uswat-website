import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/vc-office/'

export const vcOffice: OfficeProfile = {
  slug: 'vc-office',
  lists: ['administration'],
  group: 'Offices and boards',
  name: 'Office of the Vice Chancellor',
  shortName: 'Vice Chancellor’s Office',
  lead: 'The Vice Chancellor and the PS to Vice Chancellor, who is also the focal person for the Prime Minister’s Complaint Portal.',
  banner: officeBanner('vc-office', 'Office of the Vice Chancellor. University of Swat.'),
  hero: officeHero('vc-office'),
  stats: [{ value: 2, label: 'officers named with a title' }],
  people: [
    { id: 'husnul-amin', name: 'Prof. Dr. Husnul Amin', title: 'Vice Chancellor' },
    { id: 'tariq-kamal', name: 'Mr. Tariq Kamal', title: 'PS to Vice Chancellor and Focal Person, Prime Minister’s Complaint Portal' },
  ],
  phones: [{ label: 'PS to Vice Chancellor', number: '0946-730510' }],
  emails: ['vc@uswat.edu.pk'],
  officialPage: PAGE,
  sources: [{ label: 'VC Office page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The page also names Mr. Naveed Iqbal without a title; he is left out until the office gives one.',
    'The page gives no address or hours. A personal e-mail for the PS to Vice Chancellor is not shown here.',
  ],
}
