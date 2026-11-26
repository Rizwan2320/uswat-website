import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/maincampus/'

export const mainCampus: OfficeProfile = {
  slug: 'maincampus',
  path: '/campuses/main',
  trail: [{ label: 'Campus life', href: '/campuses/main' }],
  lists: [],
  group: 'Departments',
  name: 'Main Campus',
  shortName: 'Main Campus',
  lead: 'The main campus at Charbagh: the teaching departments by building, and the administrative offices that work from it.',
  banner: officeBanner('maincampus', 'Main Campus. University of Swat.'),
  hero: officeHero('maincampus'),
  stats: [
    { value: 4, label: 'buildings with teaching departments' },
    { value: 27, label: 'departments and programmes listed' },
    { value: 13, label: 'administrative offices listed' },
  ],
  itemLists: [
    {
      title: 'Academic Block C',
      items: [
        'Department of Botany',
        'Department of Agricultural Sciences and Forestry',
        'Department of Biotechnology, Genetics, Forensic and Microbiology',
        'Department of Psychological Studies',
        'Department of Mathematics & Statistics',
        'Department of Economics and Development Studies',
        'Department of Zoology',
      ],
    },
    {
      title: 'Academic Block A',
      items: [
        'Department of Geology',
        'Department of Computer and Software Technologies',
        'Department of Chemistry',
        'Department of Media and Communication Studies',
        'Department of Environmental Sciences',
      ],
    },
    {
      title: 'Academic Block B',
      items: [
        'Department of Education and Staff Training',
        'Department of Management and Commerce',
        'Department of Islamic and Arabic Studies',
        'Department of Social and Gender Studies',
        'Department of Law and Shariah',
        'Department of Archaeology',
      ],
    },
    {
      title: 'Allied Health Sciences Building',
      items: [
        'Department of Physics',
        'Doctor of Physical Therapy (DPT)',
        'BS Dental Technology',
        'BS Medical Laboratory Technology (MLT)',
        'Department of English and Foreign Languages',
        'Department of Pashto and Local Languages',
        'Department of Urdu',
        'Department of Pakistan Studies',
        'Department of Tourism and Hospitality',
      ],
    },
    { title: 'Hunerkada', items: ['Hunerkada (Center of Excellence for Art & Culture)'] },
    {
      title: 'Administrative departments',
      items: [
        'Office of the Vice Chancellor',
        'Office of the Vice Pro Chancellor',
        'Office of the Registrar',
        'Office of the Controller of Examinations',
        'Office of Research, Innovation and Commercialization (ORIC)',
        'Central Library Office',
        'Office of the Treasurer',
        'Office of the Provost',
        'Directorate of Planning and Development',
        'Directorate of Administration',
        'Directorate of Information Technology',
        'Directorate of Works',
        'Quality Enhancement Cell',
      ],
      note: 'The offices have their own pages under Administration.',
    },
  ],
  people: [],
  officialPage: PAGE,
  sources: [{ label: 'Main Campus page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The page lists departments under four buildings and Hunerkada but gives no address, telephone number or map for the campus.',
    'The old page spells the Computer and Software department in the singular; the department’s name here follows the university’s current usage.',
    'The Allied Health Sciences Building list also holds language, physics and tourism departments in the copy that was read; the university will confirm which building each department sits in.',
  ],
}
