import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/directorate-of-administration/'

export const administrationDirectorate: OfficeProfile = {
  slug: 'directorate-of-administration',
  lists: ['administration'],
  group: 'Directorates',
  name: 'Directorate of Administration',
  shortName: 'Administration',
  lead: 'The Director and two Deputy Directors of Administration, at the Administration Block on the Main Campus.',
  banner: officeBanner('directorate-of-administration', 'Directorate of Administration. University of Swat.'),
  hero: officeHero('directorate-of-administration'),
  stats: [{ value: 3, label: 'officers named on the office page' }],
  itemLists: [{ title: 'Form listed on the office page', items: ['Vehicle Proforma with movement order'] }],
  people: [
    { id: 'hazrat-bilal', name: 'Prof. Dr. Hazrat Bilal', title: 'Director Administration' },
    { id: 'sher-shah', name: 'Dr. Sher Shah', title: 'Deputy Director Administration' },
    { id: 'amir-hayat-khan', name: 'Mr. Amir Hayat Khan', title: 'Deputy Director Administration' },
  ],
  address: 'Administration Block, Main Campus at Charbagh',
  emails: ['ao@uswat.edu.pk'],
  officialPage: PAGE,
  sources: [{ label: 'Directorate of Administration page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The page is short: three names, one form title, an address and an e-mail. It gives no telephone number, hours or description of the directorate’s work.',
    'The form is named on the page without a link in the copy that was read.',
  ],
}
