import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/women-campus/'

export const womenCampus: OfficeProfile = {
  slug: 'women-campus',
  path: '/campuses/women',
  trail: [{ label: 'Campus life', href: '/campuses/main' }],
  lists: [],
  group: 'Departments',
  name: 'Women Campus',
  shortName: 'Women Campus',
  lead: 'The women’s sub campus of the University of Swat, inaugurated on 25 July 2017, with six departments that include the College of Home Sciences.',
  banner: officeBanner('women-campus', 'Women Campus. University of Swat.'),
  hero: officeHero('women-campus'),
  stats: [
    { value: 6, label: 'departments on the campus' },
    { value: 5, label: 'Home Economics disciplines' },
    { value: '25 Jul 2017', label: 'campus inaugurated' },
  ],
  about: [
    'The College of Home Sciences is a constituent college of the University of Swat. The university monitors its academic activities and its administrative and financial issues.',
    'The college was founded in 2013 to create a distinguished centre of excellence for teaching and research in Home Economics. It is a professional-level college offering specialised and technical courses in five disciplines: Art & Design, Food & Nutrition, Human Development & Family Studies, Management Studies, and Textile & Clothing.',
    'With the establishment of the Women sub campus, inaugurated on 25 July 2017, the Home Economics department of the college became one of the departments of the Women Campus.',
    'The subjects offered enhance and add to the professional and transferable skills of young women, so that they can lead positive and productive change in their communities and nationwide, taking part in discussions and decisions at home and at national level.',
  ],
  itemLists: [
    {
      title: 'Departments at the Women Campus',
      items: [
        'Department of Zoology',
        'Department of Botany',
        'Department of Psychological Studies',
        'Department of Home Economics',
        'Department of Computer and Software Technologies',
        'Department of English and Foreign Languages',
      ],
    },
    {
      title: 'Home Economics disciplines',
      items: ['Art & Design', 'Food & Nutrition', 'Human Development & Family Studies', 'Management Studies', 'Textile & Clothing'],
    },
    {
      title: 'What the campus sets out to give its students',
      items: [
        'Preparation of the individuals to become professionals for the development of community and environment.',
        'Up-to-date and modern education, to develop social sensibilities and prepare students to manage their roles as individuals, family members and citizens of the state.',
        'To gear women towards a number of professional careers, giving them countless opportunities to improve their living standards.',
        'To give women a realisation of the importance of their distinct role as nation builders.',
        'To expose students to modern knowledge and technology, so they are familiar with advances in the industrial sector.',
        'To educate women so that they can be useful individuals and play their role as effective members of a family.',
        'To prepare leaders in the fields of Home Economics: food and nutrition, institutional food management, home management and housing, child development and social relationship, clothing and textile and related art.',
        'To contribute to the quality and standard of life in Pakistan and to strengthen the family as the foundation of the nation.',
        'To provide excellent education.',
        'To train and prepare graduate students for careers in scientific psychology and scientifically based professional practice.',
        'To carry out these educational goals on the principles of scholarly excellence, interdisciplinary collaboration and wide-ranging psychological services.',
        'To assist students in developing the skills and knowledge needed for success after the degree.',
        'To impart a high-quality and versatile education in a congenial learning environment, where students acquire modern knowledge in Psychology and become effective practitioners and scholars who work on psychological and social problems.',
        'Preparation of an outstanding faculty of scientific researchers in Botany and biodiversity, opening ways to conserve national natural resources and the bio-civilised heritage.',
        'Studies and research to identify natural resources and wildlife, and constructive programmes for better use of indigenous plant resources.',
        'To keep pace with current events and scientific interests in the biotic components of environmental issues, facing their problems and inspiring hope for a better life.',
        'Contribution to national policies that protect living organisms, with studies and care of environmental issues, to find appropriate solutions at local and international levels.',
      ],
      note: 'These are the objectives as the university’s page lists them, in its order.',
    },
  ],
  people: [{ id: 'mahrukh-anum', name: 'Dr. Mahrukh Anum', title: 'Campus Coordinator, Women Campus, and Warden, Women Hostel' }],
  address: 'Girls Hostel, Main Campus, University of Swat',
  emails: ['womencampus@uswat.edu.pk'],
  officialPage: PAGE,
  sources: [{ label: 'Women Campus page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The page gives no telephone number or hours, and does not say which programmes each of the six departments offers.',
    'The page also lists a personal e-mail for the coordinator; only the campus address is shown here.',
    'The old page spells the Computer and Software department in the singular; the department’s name here follows the university’s current usage.',
  ],
}
