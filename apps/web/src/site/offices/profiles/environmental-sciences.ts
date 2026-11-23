import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/department-of-environmental-sciences/'

export const environmentalSciences: OfficeProfile = {
  slug: 'environmental-sciences',
  lists: [],
  path: '/academics/departments/environmental-sciences',
  trail: [
    { label: 'Academics', href: '/academics' },
    { label: 'Departments', href: '/academics/departments' },
  ],
  group: 'Departments',
  name: 'Department of Environmental Sciences',
  shortName: 'Environmental Sciences',
  lead: 'Established in 2012, with BS, MS/MPhil and PhD programmes and a one-year diploma in geomatics.',
  banner: officeBanner('environmental-sciences', 'Department of Environmental Sciences. University of Swat.'),
  hero: officeHero('environmental-sciences'),
  stats: [
    { value: 4, label: 'programmes listed' },
    { value: 8, label: 'faculty listed on the department page' },
  ],
  about: [
    'The Department of Environmental Sciences was established in 2012 to give students the knowledge, understanding and skills to preserve, protect and rehabilitate the local and global environment and to build a sustainable future. The programme aims to pioneer a new generation of research and teaching methods, prepares graduates to understand environmental systems, predict environmental change and take part in managing the environment, and contributes to the promotion of a sustainable society.',
    'The department’s overall goal is to become a leading institution in environmental sciences, judged by the quality of its graduates, the number of research scholars, the quality and output of its scientific research, and its services to the community and the public sector in analyzing and managing environmental issues.',
    'The degree gives a broad foundation of science-based skills for careers across the environmental professions, particularly environmental protection and management. A graduate is expected to understand contemporary issues in environmental management, the interactions between physical processes and ecosystems, and the legislative and ethical framework within which environmental scientists work.',
    'Research in the department is basic, problem-oriented and solution-driven, across environmental sciences, technology, resource management, ecology and sustainability. Expertise ranges from natural resource management, environmental pollution and control, water and wastewater treatment and solid waste management to biotechnology, toxicology, environmental economics, environmental assessment and climate change. An environmental laboratory for physicochemical and biological analysis, and a GIS laboratory, are being established; an up-to-date collection of books is available in the Central Library at the Main Campus, Charbagh.',
  ],
  statements: [
    {
      title: 'Vision',
      paragraphs: [
        'The department focuses on pioneering a new generation of research and teaching methods that understand the fundamental processes behind environmental pollution and natural resource degradation and arrive at solutions to pressing societal problems, and on preparing graduates to understand environmental systems, predict environmental change, take part in managing the environment and contribute to a sustainable society.',
      ],
    },
  ],
  itemLists: [
    {
      title: 'Programmes offered',
      items: [
        'BS Environmental Sciences (four years)',
        'BS Disaster Preparedness and Climate Change (four years)',
        'Graduate programme (MS/MPhil and PhD)',
        'Postgraduate Diploma (one year) in Geomatics (GIS and RS)',
      ],
    },
    {
      title: 'Mission',
      items: [
        'To provide formal education and research in environmental and conservation sciences to bring education standards up to the international level',
        'To provide a good research environment for publishing results in journals of international repute',
        'To provide professional services such as special training, analyses, surveys and consultancies to manufacturing and processing industries, NGOs, CBOs, engineering firms and others',
      ],
    },
    {
      title: 'Research groups',
      items: [
        'Plastic-Microbe-ClimateNexus and Biogeochemical Cycling Group: bioremediation strategies for cleaning up contaminated environments, using local plants and microbes (bacteria, algae and fungi) that tolerate or accumulate contaminants',
        'Ecological Risk Assessment and Environmental Management Group',
        'A group whose page entry lists forests, water and land resources management, GIS mapping and RS LUC, climate change and flood hydrology, biodiversity conservation, glacial studies and GLOFs, and the impacts of climate change on agriculture (its name is not given)',
      ],
    },
  ],
  people: [
    { id: 'muhammad-qasim', name: 'Dr. Muhammad Qasim', title: 'Professor and Chairperson; Pro Vice Chancellor; PhD from the University of Leeds, UK; post-doc at Hokkaido University, Japan' },
    { id: 'javeed-nawab', name: 'Dr. Javeed Nawab', title: 'Professor' },
    { id: 'kifayatullah-khan', name: 'Dr. Kifayatullah Khan', title: 'Associate Professor, PhD in Environmental Sciences, University of Peshawar' },
    { id: 'sanaullah', name: 'Dr. Sanaullah', title: 'Assistant Professor, MS in Environmental Sciences, COMSATS University, Abbottabad' },
    { id: 'anwarzeb-khan', name: 'Dr. Anwarzeb Khan', title: 'Assistant Professor' },
    { id: 'wajid-rashid', name: 'Dr. Wajid Rashid', title: 'Lecturer, PhD in Environmental Sciences, Beijing Normal University, China' },
    { id: 'muhammad-ayaz', name: 'Dr. Muhammad Ayaz', title: 'Lecturer, MPhil in Environmental Biotechnology and Bioremediation' },
    { id: 'khalil-ur-rahman', name: 'Dr. Khalil Ur Rahman', title: 'Adjunct faculty; Associate Professor, Shandong University, Jinan, China' },
  ],
  address: 'Academic Block-A, University of Swat',
  officialPage: PAGE,
  sources: [{ label: 'Department of Environmental Sciences page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The page lists the programmes twice with different names: “BS Disaster Preparedness and Climate Change” in one list and “BS Climate Change” in the other. The first list is shown.',
    'One of the four mission lines on the page is cut off mid-sentence (“…existent in various”), so it is not shown.',
    'The page gives no department phone number or e-mail address, only personal addresses of staff, which are not shown here.',
    'The MPhil in Environmental Biotechnology and Bioremediation appears next to Dr. Muhammad Ayaz in the research group text, while his staff entry gives no degree; it is shown as the page words it.',
  ],
}
