import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/department-of-geology/'

export const geology: OfficeProfile = {
  slug: 'geology',
  lists: [],
  path: '/academics/departments/geology',
  trail: [
    { label: 'Academics', href: '/academics' },
    { label: 'Departments', href: '/academics/departments' },
  ],
  group: 'Departments',
  name: 'Department of Geology',
  shortName: 'Geology',
  lead: 'BS Geology, a four-year programme in eight semesters, taught since 2014.',
  banner: officeBanner('geology', 'Department of Geology. University of Swat.'),
  hero: officeHero('geology'),
  stats: [
    { value: 1, label: 'degree programme listed' },
    { value: 5, label: 'faculty listed on the department page' },
  ],
  about: [
    'The Department of Geology became functional in the University of Swat in 2014 and started the BS Geology programme. For the first batch, the session 2014-2018, the department enrolled 40 students. It is a four-year programme of eight semesters, each running for sixteen weeks. The degree is awarded on successful completion of a minimum of 132 credit hours, including six credits for the project, with a CGPA of at least 2.0.',
    'The courses of BS Geology are designed to train professional geologists by imparting high quality education in the field. Students are trained to apply concepts, principles and best practices in the oil and gas sector, in mining departments and in other mineral exploration.',
  ],
  statements: [
    {
      title: 'Mission',
      paragraphs: [
        'The department’s mission is to provide state of the art teaching and research facilities to produce professional graduates at the highest national and international levels for academic institutions, oil companies and mineral exploration and mining. It also aims to provide a research-based environment by establishing laboratories equipped with sophisticated research facilities and by building strong collaborations with other renowned institutions.',
      ],
    },
    {
      title: 'Vision',
      paragraphs: [
        'Building on the existing strengths, the Centre for Earth & Space Sciences is bridging a link between academia and industry. Such a link will help in the academic and professional growth of the students and the faculty members.',
      ],
    },
    {
      title: 'Mission of the BS Geology programme',
      paragraphs: [
        'The BS (four-year) programme is aimed at promoting scientific knowledge about the earth and its mineral resources, and at enhancing the knowledge and skills students need to start careers as geologists in energy, mineral resources and environmental consulting, or to continue in more specialised areas of geology.',
      ],
    },
  ],
  itemLists: [
    { title: 'Degree programme', items: ['BS Geology (four years, eight semesters)'] },
    {
      title: 'Programme objectives',
      items: [
        'Teaching on campus along with fieldwork at geologically important sites of the country (the Centre’s primary function)',
        'To provide a high quality learning environment that is challenging and professional',
        'To promote scientific knowledge about the earth and its mineral resources',
        'To link academia and industry for the academic and professional growth of students and faculty members',
      ],
    },
    {
      title: 'Expected outcomes',
      items: [
        'Explain the importance of geology and its applicability in relevant fields',
        'Gain broad fundamental geological knowledge, including rock, mineral and fossil identification',
        'Perform field-based research and produce accurate geologic maps and subsurface models',
        'Analyze data and solve geological problems',
      ],
      note: 'The page introduces these with “Graduates of the Geology Program will be able to”.',
    },
    {
      title: 'Eligibility (Intermediate Science or equivalent, at least 45% marks)',
      items: [
        'Science group',
        'Other groups, where Chemistry, Physics and Mathematics were studied',
        'Three-year Diploma in Associate Engineering (DAE), equivalent to F.Sc',
      ],
    },
    {
      title: 'Groups of elective courses',
      items: [
        'Mineralogy and Petrology',
        'Paleontology and Stratigraphy',
        'Economic Geology',
        'Engineering Geology',
        'Sedimentology',
        'Industrial Mineralogy',
        'Environmental Geosciences',
        'Structure, Tectonics and Neotectonics',
        'Petroleum Geosciences',
        'Applied Geophysics',
      ],
      note: 'The page lists the courses, codes and credit hours of every group and of each semester; they are on the university’s page.',
    },
  ],
  people: [
    { id: 'zaheen-ullah', name: 'Dr. Zaheen Ullah', title: 'Assistant Professor' },
    { id: 'adnan-khan-geology', name: 'Mr. Adnan Khan', title: 'In-charge and Lecturer' },
    { id: 'muhammad-ibrar', name: 'Mr. Muhammad Ibrar', title: 'Lecturer' },
    { id: 'subhan-ullah', name: 'Dr. Subhan Ullah', title: 'Lecturer' },
    { id: 'muhammad-idrees', name: 'Mr. Muhammad Idrees', title: 'Lecturer' },
  ],
  address: 'Main Campus at Charbagh',
  emails: ['cess@uswat.edu.pk'],
  officialPage: PAGE,
  sources: [{ label: 'Department of Geology page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The page gives the credit hours needed for the degree three ways: a minimum of 132 in the introduction, 130 as the HEC minimum in a note, and “increased up to 139” after the HEC revised curriculum of 2013. Which applies is not stated.',
    'The vision text names the “Centre for Earth & Space Sciences”, and the contact address is cess@; the page calls the unit both the Department of Geology and the Centre.',
    'The page gives no phone number and no message from the head of the department.',
  ],
}
