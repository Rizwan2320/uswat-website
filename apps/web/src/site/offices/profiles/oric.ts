import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/oric-2/'

export const oric: OfficeProfile = {
  slug: 'oric-2',
  lists: ['research'],
  group: 'Offices and boards',
  name: 'Office of Research, Innovation and Commercialization (ORIC)',
  shortName: 'ORIC',
  lead: 'The university’s research office, recognised by the Higher Education Commission in the highest category in 2022.',
  banner: officeBanner('oric-2', 'Office of Research, Innovation and Commercialization. ORIC.'),
  hero: officeHero('oric-2'),
  stats: [
    { value: 2022, label: 'HEC recognition, highest category' },
    { value: 5, label: 'staff listed on the office page' },
    { value: '5–7 Feb 2025', label: 'latest conference listed' },
  ],
  people: [
    { id: 'anwar-hussain', name: 'Dr. Anwar Hussain', title: 'Professor and Director' },
    { id: 'khurshid-alam', name: 'Mr. Khurshid Alam', title: 'Deputy Director' },
    { id: 'ghulam-nabi', name: 'Dr. Ghulam Nabi', title: 'Deputy Director (Innovation and Commercialization)' },
    { id: 'iftikhar-alam', name: 'Mr. Iftikhar Alam', title: 'Assistant Director (Liaison, University Industry Linkages)' },
    { id: 'riaz-khan', name: 'Mr. Riaz Khan', title: 'Naib Qasid' },
  ],
  peopleNote: 'Names and titles are from the staff table on the office’s page.',
  milestonesTitle: 'Conferences listed by the office',
  milestones: [{ date: '2025-02-05', title: 'International Conference on “Sustainable Forest Management” (5 to 7 February 2025)' }],
  officialPage: PAGE,
  sources: [{ label: 'ORIC page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-05',
  openPoints: [
    'The text of the university’s ORIC page names a different Director (Dr. Muhammad Tariq) from its staff table. The table is used here; the office will confirm.',
    'The page gives no phone number, e-mail or address for the office.',
  ],
}
