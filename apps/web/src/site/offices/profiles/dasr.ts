import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/advanced-studies-and-research-board/'

export const dasr: OfficeProfile = {
  slug: 'advanced-studies-and-research-board',
  lists: ['research', 'administration'],
  group: 'Directorates',
  name: 'Directorate of Advanced Studies and Research (DASR)',
  shortName: 'DASR',
  lead: 'The directorate for advanced studies and research, established in December 2014.',
  banner: officeBanner('advanced-studies-and-research-board', 'Directorate of Advanced Studies and Research. DASR.'),
  hero: officeHero('advanced-studies-and-research-board'),
  stats: [
    { value: 'Dec 2014', label: 'established' },
    { value: 3, label: 'staff listed on the office page' },
  ],
  people: [
    { id: 'haidar-ali', name: 'Dr. Haidar Ali', title: 'Director' },
    { id: 'shahid-ali', name: 'Dr. Shahid Ali', title: 'Additional Director' },
    { id: 'ubaid-ullah', name: 'Mr. Ubaid Ullah', title: 'Listed on the office page' },
  ],
  address: 'Administration Block, Main Campus at Charbagh, Swat',
  emails: ['dasr@uswat.edu.pk'],
  officialPage: PAGE,
  sources: [{ label: 'DASR page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-05',
  openPoints: [
    'The page’s heading says “Advance Studies” and its text says “Advanced Studies and Research Board”; “Advanced Studies and Research” is used here.',
    'The page gives no phone number and does not state Mr. Ubaid Ullah’s designation.',
  ],
}
