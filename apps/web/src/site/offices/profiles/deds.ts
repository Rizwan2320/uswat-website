import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/department-of-economics-and-development-studies/'

export const deds: OfficeProfile = {
  slug: 'economics-and-development-studies',
  lists: [],
  path: '/academics/departments/economics-and-development-studies',
  trail: [
    { label: 'Academics', href: '/academics' },
    { label: 'Departments', href: '/academics/departments' },
  ],
  group: 'Departments',
  name: 'Department of Economics and Development Studies',
  shortName: 'Economics and Development Studies',
  lead: 'BS Economics and BS Development Studies, with MPhil and PhD programmes in preparation.',
  banner: officeBanner('economics-and-development-studies', 'Department of Economics and Development Studies. University of Swat.'),
  hero: officeHero('economics-and-development-studies'),
  stats: [
    { value: 2, label: 'degree programmes listed' },
    { value: 8, label: 'faculty listed on the department page' },
  ],
  about: [
    'Pakistan, and Khyber Pakhtunkhwa in particular, faces challenges such as weak governance, population growth, poverty, conflict, water-food-energy insecurity, climate change, biodiversity loss, depletion of natural capital and macroeconomic instability. Academic and research institutions have a role in suggesting options. The Department of Economics and Development Studies (DEDS) has the potential to design and teach courses and to inquire freely into real-world issues at home and abroad.',
    'DEDS is one of the pioneer departments of the University of Swat. Its graduates are pursuing higher studies at prestigious institutions or serving in private and public sector organisations. The department currently offers BS degrees in Economics and in Development Studies and is in the process of launching MPhil and PhD programmes in both. It also plans a Research Centre for Sustainable Development, to give input to government departments and policy makers on key provincial and national issues.',
  ],
  statements: [
    {
      title: 'Vision',
      paragraphs: [
        'To impart quality education in the fields of economics and development studies, to excel in research at par with reputed international institutions, and to establish linkages with national and international institutions.',
      ],
    },
    {
      title: 'Mission',
      paragraphs: [
        'To develop critical thinking among students and enable them to take informed decisions in practical life. Students are engaged in seminars, training, workshops and research activities to keep them updated and prepared for any job of responsibility assigned to them in future.',
      ],
    },
    {
      title: 'Message from the chairman',
      paragraphs: [
        'Academic institutions should work beyond their traditional role of teaching and act as a catalyst for the uplift of societies. Faculty and researchers not only engage the youth on key global, regional and local challenges but also conduct fair research on cross-cutting issues of the economy to guide policy makers. Such institutions also develop linkages with national and international organisations to tackle these challenges, involving faculty, researchers and students.',
        'DEDS offers BS Economics and BS Development Studies and is in process to go for MPhil and PhD programmes. Despite limited resources, it is also planning to start a Research Centre for Sustainable Development (RCSD) to carry out research on key issues of local, regional and global interest, to hunt funding opportunities, build the capacity of interns, develop linkages and organise awareness campaigns, training, workshops and seminars.',
      ],
    },
  ],
  itemLists: [
    { title: 'Degree programmes', items: ['BS in Economics', 'BS in Development Studies'] },
    {
      title: 'Objectives',
      items: [
        'To equip students with sound theoretical and applied knowledge in line with international standards',
        'To enlighten students about the economic and development challenges in the country and around the world',
        'To prepare capable human resource with the research skills to contribute to institutions and society',
        'To provide policy input on key issues of the economy to stakeholders through policy briefs and scholarly articles',
        'To establish linkages with national and international institutions to promote research and academic activities',
      ],
    },
  ],
  people: [
    { id: 'anwar-hussain', name: 'Dr. Anwar Hussain', title: 'Professor and Dean' },
    { id: 'umar-hayat', name: 'Dr. Umar Hayat', title: 'Professor and Chairman' },
    { id: 'shahid-ali', name: 'Dr. Shahid Ali', title: 'Associate Professor, Gold Medalist' },
    { id: 'fazal-rabbi', name: 'Dr. Fazal Rabbi', title: 'Assistant Professor' },
    { id: 'muhammad-imad-khan', name: 'Dr. Muhammad Imad Khan', title: 'Lecturer' },
    { id: 'jawad-mohammad', name: 'Mr. Jawad Mohammad', title: 'Lecturer, on study leave' },
    { id: 'tariq-ziad-khwaja', name: 'Mr. Tariq Ziad Khwaja', title: 'Lecturer' },
    { id: 'naveed-ali', name: 'Dr. Naveed Ali', title: 'Lecturer, Gold Medalist' },
  ],
  milestonesTitle: 'Board of Studies',
  milestones: [
    {
      date: '2021-03-11',
      title:
        'The second meeting of the Board of Studies, chaired by Dr. Anwar Hussain, approved and recommended the scheme of studies for the BS, MPhil and PhD programmes in Economics',
    },
  ],
  emails: ['deds@uswat.edu.pk'],
  officialPage: PAGE,
  sources: [{ label: 'Department of Economics and Development Studies page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The chairman’s message on the page is unsigned. The page lists Dr. Umar Hayat as Professor and Chairman and Dr. Anwar Hussain as Professor and Dean, while its 2021 Board of Studies item calls Dr. Anwar Hussain the Chairman.',
    'The page gives no phone number or address.',
    'The 2021 item says the Board recommended MPhil and PhD schemes of studies in Economics, while the page elsewhere says the department is still in the process of launching them; the page does not say whether they have started.',
  ],
}
