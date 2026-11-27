import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/controller-of-examination-office/'

export const coe: OfficeProfile = {
  slug: 'controller-of-examination-office',
  lists: ['administration'],
  group: 'Offices and boards',
  name: 'Office of the Controller of Examinations',
  shortName: 'Examinations',
  lead: 'Four sections handle the university’s examinations: window, degree and secrecy, semester and conduct.',
  banner: officeBanner('controller-of-examination-office', 'Office of the Controller of Examinations. University of Swat.'),
  hero: officeHero('controller-of-examination-office'),
  stats: [
    { value: 4, label: 'sections with their own phone' },
    { value: 7, label: 'staff named on the office page' },
  ],
  servicesTitle: 'Sections',
  services: [
    { icon: 'search', title: 'Window Section', text: 'Telephone 0946-920856.' },
    { icon: 'cap', title: 'Degree and Secrecy Section', text: 'Telephone 0946-920832.' },
    { icon: 'layers', title: 'Semester Section', text: 'Telephone 0946-920833.' },
    { icon: 'shield', title: 'Conduct Section', text: 'Telephone 0946-920834.' },
  ],
  people: [
    { id: 'aziz-ur-rehman', name: 'Mr. Aziz ur Rehman', title: 'Controller of Examinations' },
    { id: 'imtiaz-ali', name: 'Mr. Imtiaz Ali', title: 'Additional Controller of Examinations' },
    { id: 'amir-khan', name: 'Dr. Amir Khan', title: 'Deputy Controller of Examinations' },
    { id: 'amir-faraz', name: 'Mr. Akhunzada Amir Faraz', title: 'Assistant Controller of Examinations (Secrecy and Degree)' },
    { id: 'arshad-hussain', name: 'Mr. Arshad Hussain', title: 'Assistant Controller of Examinations (Conduct)' },
    { id: 'mehboob-alam', name: 'Mr. Mehboob Alam', title: 'Senior Clerk (Secrecy and Degree Section)' },
    { id: 'bacha-hussain', name: 'Mr. Bacha Hussain', title: 'Senior Clerk (Degree Section)' },
  ],
  address: 'Main Campus at Charbagh',
  phones: [
    { label: 'Window Section', number: '0946-920856' },
    { label: 'Degree and Secrecy Section', number: '0946-920832' },
    { label: 'Semester Section', number: '0946-920833' },
    { label: 'Conduct Section', number: '0946-920834' },
  ],
  officialPage: PAGE,
  sources: [{ label: 'Controller of Examinations page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-05',
  openPoints: ['The page gives no e-mail for the office, and lists one more staff entry without a name or designation, which is left out.'],
}
