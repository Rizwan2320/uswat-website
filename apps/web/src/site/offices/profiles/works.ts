import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/directorate-of-works/'

export const works: OfficeProfile = {
  slug: 'directorate-of-works',
  lists: ['administration'],
  group: 'Directorates',
  name: 'Directorate of Works',
  shortName: 'Works',
  lead: 'The directorate of works at the main campus, open Monday to Friday from 8:00 am to 4:30 pm.',
  banner: officeBanner('directorate-of-works', 'Directorate of Works. University of Swat.'),
  hero: officeHero('directorate-of-works'),
  stats: [
    { value: '8:00–4:30', label: 'Monday to Friday' },
    { value: 2, label: 'staff listed on the office page' },
  ],
  people: [
    { id: 'habib-rashid', name: 'Engr. Habib Rashid', title: 'Director Works' },
    { id: 'shah-faisal', name: 'Engr. Shah Faisal', title: 'Deputy Director Works' },
  ],
  address: 'Main Campus at Charbagh (the page’s introduction says “Dakorrak-Charbagh, Swat”)',
  phones: [{ number: '0946-730505' }],
  emails: ['works@uswat.edu.pk'],
  hours: 'Monday to Friday, 08:00 AM to 04:30 PM',
  officialPage: PAGE,
  sources: [{ label: 'Directorate of Works page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-05',
}
