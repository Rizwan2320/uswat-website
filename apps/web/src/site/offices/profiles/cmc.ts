import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/department-of-management-commerce/'

export const cmc: OfficeProfile = {
  slug: 'management-commerce',
  lists: [],
  path: '/academics/departments/management-commerce',
  trail: [
    { label: 'Academics', href: '/academics' },
    { label: 'Departments', href: '/academics/departments' },
  ],
  group: 'Departments',
  name: 'Department of Management and Commerce',
  shortName: 'Management and Commerce',
  lead: 'Teaching, research and advisory support for industry in District Swat, with degrees from BBA to PhD.',
  banner: officeBanner('management-and-commerce', 'Department of Management and Commerce. University of Swat.'),
  hero: officeHero('management-and-commerce'),
  stats: [
    { value: 11, label: 'degree programmes listed' },
    { value: 11, label: 'faculty listed on the department page' },
  ],
  about: [
    'The Department of Management and Commerce strives to set up the societal narrative and discourse in the right direction through provision of outstanding teaching, conduct of relevant research and advisory support to local industry in the catchment area of District Swat. The Department of Management and Commerce at University of Swat, endeavors to align the paradoxical expectations of industry and academia by filling the social vacuum through practice-oriented degree programs at bachelors, Masters and PhD levels.',
    'The degree programs of BBA, MBA, MS and PhD offered at Department of Management and Commerce focuses on offering a complete set of expertise in domains of Human Resource Management, Entrepreneurship, Finance and Marketing with an emphasis on digitization in line with University of Swat declaration of 2023 as digital year. The department strives to create owner managers and entrepreneurs with value creation competencies. Hence, CM&C caters for ample opportunities for internship, industry trips and market oriented research projects for the welfare of all the salient stakeholders.',
    'The department is focusing hard to touch base with relevant employers for student placement and maintaining a close liaison with industry and alumni to manage its reputation and uphold public confidence in the quality assurance of its programs at undergraduate and graduate levels. Moreover, the department provides ample consideration for student-led co-curricular activities as evident from a vibrant student body (societies) and extra-curricular activities such as sports. Finally, the departmental faculty in addition to teaching and research strive to provide input to new products, processes or policy to industry.',
  ],
  statements: [
    {
      title: 'Vision',
      paragraphs: [
        'Our vision is to nurture second to none graduates by acting as a springboard for students to achieve their true potential. The essence of our vision and mission statements is best espoused in our credo statement: “Technological at heart, Inventive in mind and socially responsible in action”.',
        'The achievement of our vision is contingent upon our incessant adherence to principles of access, quality, relevance, fairness, service, and upholding merit in line with mission and vision statement of the university of Swat.',
      ],
    },
    {
      title: 'Mission',
      paragraphs: [
        'The Mission of the Department of Management and Commerce, University of Swat revolves around development of wholesome individuals through integration of a unique blend of curricular, co-curricular and extracurricular activities to combat the issue of credential creep and educational inflation.',
        'Our mission is to create value creating individuals who create value for themselves and value for others in the form of useful contributions to triple helix stakeholders (Academia, Industry & Government). The degree programs are designed to relieve the societal pain points and create avenues for development of the catchment area of district Swat by germinating innovation and instilling a spirit of national competitiveness. To achieve a balanced scorecard in terms of people, planet and prosperity (triple bottom line) we strive to induce positive social, economic and environmental change in catchment area of Swat.',
      ],
    },
  ],
  itemLists: [
    {
      title: 'Degree programmes',
      items: [
        'Bachelor of Business Administration (Hons)',
        'BS Digital Marketing',
        'BS Business Analytics',
        'BS Accounting and Finance',
        'BS Islamic Banking and Finance',
        'Master of Business Administration (MBA) for Business Stream, 35 credit hours',
        'Master of Business Administration (MBA) for Non-Business Stream, 65 credit hours',
        'Executive Master of Business Administration (EMBA) for Business Stream, 35 credit hours',
        'Executive Master of Business Administration (EMBA) for Non-Business Stream, 65 credit hours',
        'MS in Management Sciences',
        'PhD in Management Sciences',
      ],
      note: 'The department page links the course contents of these programmes; they are on the university’s page.',
    },
  ],
  people: [
    { id: 'hazrat-bilal', name: 'Dr. Hazrat Bilal', title: 'Director and Professor, PhD in Management Sciences' },
    { id: 'nasir-shaheen', name: 'Dr. Nasir Shaheen', title: 'Associate Professor, PhD in Management Sciences' },
    { id: 'muhammad-tariq-mc', name: 'Dr. Muhammad Tariq', title: 'Associate Professor, PhD in Management Sciences' },
    { id: 'lala-rukh', name: 'Dr. Lala Rukh', title: 'Associate Professor in Finance, PhD in Management Sciences' },
    { id: 'badshah-hussain', name: 'Dr. Badshah Hussain', title: 'Assistant Professor, PhD in Management Sciences' },
    { id: 'jawad-karamat', name: 'Dr. Jawad Karamat', title: 'Assistant Professor, PhD in Management Sciences, Gold Medalist' },
    { id: 'abdul-mateen', name: 'Dr. Abdul Mateen', title: 'Lecturer in Human Resource Management, PhD in Management Sciences' },
    { id: 'neelam-akbar-marwat', name: 'Dr. Neelam Akbar Marwat', title: 'Lecturer in Marketing' },
    { id: 'khursheed-ahmad', name: 'Mr. Khursheed Ahmad', title: 'Lecturer in Finance, PhD in progress' },
    { id: 'mohammad-sohail', name: 'Dr. Mohammad Sohail', title: 'Lecturer in Finance' },
    { id: 'sangeen-khan', name: 'Dr. Sangeen Khan', title: 'Lecturer in Human Resource' },
  ],
  emails: ['cmc@uswat.edu.pk'],
  officialPage: PAGE,
  sources: [{ label: 'Department of Management and Commerce page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The page gives no phone number, address or head-of-department message. Duration, eligibility, fees and seats are not on the page.',
    'The page also lists curriculum files for “BBA (Hons) 2022” and “BBA 2025”; how the two relate is not stated, so the degree list above shows the programme once.',
    'The page names the department “Department of Management and Commerce” in its text and “CM&C” once; the old address uses “management-commerce”.',
  ],
}
