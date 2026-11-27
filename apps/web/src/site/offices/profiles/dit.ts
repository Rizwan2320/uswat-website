import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/directorate-of-it/'

export const dit: OfficeProfile = {
  slug: 'directorate-of-it',
  lists: ['administration'],
  group: 'Directorates',
  name: 'Directorate of IT',
  shortName: 'Directorate of IT',
  lead: 'Runs the university’s campus management system, networks and digital learning programmes.',
  banner: officeBanner('directorate-of-it', 'Directorate of Information Technology. University of Swat.'),
  hero: officeHero('directorate-of-it'),
  stats: [
    { value: 4, label: 'services listed' },
    { value: 4, label: 'staff listed on the office page' },
    { value: 10, label: 'dated items on the office page' },
  ],
  servicesTitle: 'Services',
  services: [
    {
      icon: 'database',
      title: 'Campus Management Solutions (CMS), ERP and LMS',
      text: 'Admission, fee, hostel, course, examination and enrolment management; student and faculty portals; event management; scholarship management.',
    },
    { icon: 'network', title: 'LAN and wireless access', text: 'Network access across the campus.' },
    { icon: 'rocket', title: 'Entrepreneurship and incubation programme', text: 'A programme the directorate runs for students and start-ups.' },
    { icon: 'cap', title: 'Blended learning and training', text: 'Training programmes for the Malakand region.' },
  ],
  people: [
    { id: 'hamdullah-younas', name: 'Mr. Hamdullah Younas', title: 'Director IT' },
    { id: 'shahid-ali-cms', name: 'Mr. Shahid Ali', title: 'CMS Support' },
    { id: 'shafi-ullah', name: 'Mr. Shafi Ullah', title: 'Network Assistant' },
    { id: 'muhammad-abbas', name: 'Mr. Muhammad Abbas', title: 'Junior Clerk' },
  ],
  milestonesTitle: 'From the directorate’s page',
  milestones: [
    { date: '2026-06-25', title: 'University of Swat launches the E-Office system' },
    { date: '2025-12-31', title: 'PMYLS Ceremony 2025' },
    { date: '2025-09-17', title: 'Inauguration of NTC Digital Services' },
    { date: '2025-08-05', title: 'Digital Learning and Skills Enrichment Initiative (DLSEI), Cohort 2' },
    { date: '2025-07-23', title: 'Digital transformation of payment' },
    { date: '2025-03-26', title: 'Seerat-un-Nabi (PBUH) Corner at the Central Library' },
    { date: '2025-03-19', title: 'Higher Education Commission approves SUJRIS' },
    { date: '2025-03-11', title: 'Smart classrooms' },
    { date: '2023-10-30', title: 'CISCO Lab inauguration' },
    { date: '2023-10-07', title: 'University of Swat unveils its technology infrastructure' },
  ],
  links: [{ label: 'University of Swat CMS portal', href: 'https://cms1.uswat.edu.pk/' }],
  officialPage: PAGE,
  sources: [
    { label: 'Directorate of IT page, University of Swat', url: PAGE },
    { label: 'University of Swat CMS portal', url: 'https://cms1.uswat.edu.pk/' },
  ],
  verifiedAt: '2026-11-05',
  openPoints: [
    'The page does not give a phone number or e-mail for the directorate. Its dated items end on 25 June 2026; nothing later was seen on 5 November 2026.',
    'The page also lists a Junior Library Attendant under the directorate; that entry is left out until the directorate confirms it.',
  ],
}
