import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/directorate-of-sports/'

export const sports: OfficeProfile = {
  slug: 'directorate-of-sports',
  lists: ['administration'],
  group: 'Directorates',
  name: 'Directorate of Sports',
  shortName: 'Sports',
  lead: 'The university’s sports directorate and its Director.',
  banner: officeBanner('directorate-of-sports', 'Directorate of Sports. University of Swat.'),
  hero: officeHero('directorate-of-sports'),
  people: [{ id: 'amjad-ali', name: 'Dr. Amjad Ali', title: 'Director Sports; Lecturer in Mathematics' }],
  emails: ['dsports@uswat.edu.pk'],
  officialPage: PAGE,
  sources: [{ label: 'Directorate of Sports page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: ['The page holds only the Director’s name and title and one e-mail. It gives no facilities, teams, events, telephone or address.'],
}
