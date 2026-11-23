import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/department-of-archaeology/'

export const archaeology: OfficeProfile = {
  slug: 'archaeology',
  lists: [],
  path: '/academics/departments/archaeology',
  trail: [
    { label: 'Academics', href: '/academics' },
    { label: 'Departments', href: '/academics/departments' },
  ],
  group: 'Departments',
  name: 'Department of Archaeology',
  shortName: 'Archaeology',
  lead: 'BS Archaeology in the Swat Valley, with a university museum of archaeology and ethnology opened in October 2025.',
  banner: officeBanner('archaeology', 'Department of Archaeology. University of Swat.'),
  hero: officeHero('archaeology'),
  stats: [
    { value: 1, label: 'degree programme listed' },
    { value: 2, label: 'faculty listed on the department page' },
  ],
  about: [
    'The Swat Valley is exceptionally rich in archaeological remains, from prehistoric times to the early Islamic era. The University of Swat launched a BS degree programme in archaeology in 2018 under the Institute of Cultural Heritage, Tourism and Hospitality. In 2025 that institute was bifurcated into the Department of Tourism and Hospitality and the Department of Archaeology, which formally started academic activities from the fall semester of 2025 in Academic Block-B of the university.',
    'The university has signed memoranda of understanding with the Directorate General of Archaeology and Museums, Government of Khyber Pakhtunkhwa, and with the Italian Archaeological Mission to Pakistan. In view of these agreements the department is expected to become one of the prominent departments of the university in exploration, excavation, conservation and joint research publications with the stakeholders.',
    'The scheme of studies follows the New Undergraduate Education Policy of the Higher Education Commission of Pakistan (effective from Spring 2025) and includes General Education, Disciplinary, Major, Interdisciplinary and Elective courses. Students also have the opportunity for internships, capstone projects, field-related experiences, museum management training and the writing of research papers.',
  ],
  statements: [
    {
      title: 'Vision',
      paragraphs: [
        'To become a leading department in archaeological research, education and heritage management in Pakistan, with a special focus on the Swat Valley and the wider Indo-Pakistan region, by fostering global collaborations, advancing innovative methods of exploration, excavation and conservation, and contributing to the preservation of cultural heritage for future generations.',
      ],
    },
  ],
  itemLists: [
    { title: 'Degree programme', items: ['BS Archaeology'], note: 'Eligibility: Intermediate or an equivalent qualification with at least 45% marks.' },
    {
      title: 'Mission',
      items: [
        'To prepare skilled professionals in archaeology and cultural heritage management who can address emerging challenges in these disciplines',
        'To equip students with the advanced knowledge and skills needed to protect and promote the cultural resources of the region',
        'To prepare graduates with diverse competencies who can contribute as policymakers and entrepreneurs',
        'To integrate the cultural heritage sector with the tourism industry, to develop the area as an archaeological tourism destination',
        'To develop students’ ability to demonstrate knowledge, apply skills and communicate ideas effectively',
        'To build professional competencies in exploration, documentation, excavation and conservation of archaeological sites and monuments of Pakistan',
        'To support human resource development by giving students advanced and updated knowledge in archaeology',
        'To prepare students to address legal issues related to cultural heritage under national legislation and international charters',
      ],
    },
    {
      title: 'Strategic plan for achieving the objectives',
      items: [
        'A modern curriculum designed in line with HEC guidelines and international trends',
        'Conservation and field-oriented courses with a strong focus on the archaeological knowledge of the region',
        'Specialised courses on the preservation, protection and promotion of archaeological sites and monuments',
        'Study of contemporary issues related to cultural heritage',
        'Regular field visits to archaeological sites and museums across Pakistan',
        'Active participation of students in workshops, seminars, excavation projects and preservation initiatives',
        'Integration of theoretical knowledge with practical training and co-curricular activities',
        'Case studies, discussions and task-oriented assignments for hands-on professional exposure',
        'A combined theoretical and practical framework to develop technically proficient human resources',
        'Courses on conservation and preservation skills for handling cultural assets',
        'Study of cultural heritage laws and charters, to manage legal issues during fieldwork',
      ],
    },
    {
      title: 'Learning outcomes',
      items: [
        'Demonstrate a sound understanding of the basic concepts of archaeology and the cultural heritage of Pakistan',
        'Apply their knowledge to protect and promote the cultural and natural resources of the region',
        'Identify and decipher ancient inscriptions on coins, birch bark manuscripts, stone slabs, pottery, rocks and boulders',
        'Analyze and interpret the ancient art and architecture of Pakistan',
        'Demonstrate knowledge of early Islamic art, architecture, numismatics and epigraphy',
        'Understand the principles of museology and apply museum-related knowledge in professional contexts',
        'Undertake major research projects, explorations and excavations independently or as part of a team',
        'Pursue careers in higher education institutions, research organizations and governmental institutions',
      ],
      note: 'The page introduces these with “Upon successful completion of the BS Archaeology program, graduates will be able to”.',
    },
  ],
  people: [
    { id: 'zarawar-khan', name: 'Dr. Zarawar Khan', title: 'In-charge; Assistant Professor in Archaeology, PhD in Archaeology, Gold Medalist' },
    { id: 'muhammad-waliullah', name: 'Mr. Muhammad Waliullah', title: 'Lecturer, Gold Medalist' },
  ],
  milestonesTitle: 'Museum',
  milestones: [
    {
      date: '2025-10-15',
      title:
        'The Uḍḍiyāna Museum of Archaeology and Ethnology was inaugurated at the University of Swat by the Vice Chancellor, to preserve archaeological and ethnological artifacts from the Swat Valley and to educate students and the public about the region’s cultural heritage',
    },
  ],
  address: 'Academic Block B, Main Campus at University of Swat, Charbagh, Swat, Khyber Pakhtunkhwa, Pakistan',
  officialPage: PAGE,
  sources: [{ label: 'Department of Archaeology page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The page gives no department phone number or e-mail address; only personal addresses of the two staff, which are not shown here.',
    'The page says the institute was bifurcated in 2025, yet its museum item of 15 October 2025 is still written under the “Institute of Cultural Heritage, Tourism and Hospitality Management” and calls Dr. Zarawar Khan its In-Charge. The page does not explain the overlap.',
    'The page links a scheme of studies for Fall 2025; its courses are not reproduced here.',
  ],
}
