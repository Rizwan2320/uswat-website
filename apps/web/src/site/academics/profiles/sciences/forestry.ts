import { officeBanner, officeHero } from '../../../offices/art'
import type { DepartmentProfile, DisciplineProfile } from '../../types'
import { year } from '../core'

import { pictures, scienceFaq } from './core'

/* Department of Agricultural Sciences and Forestry, laid out like the DCST department page (the owner's blueprint, 2026-11-24).
   FROM THE UNIVERSITY'S PAGE, read 2026-11-06 (saved copy on the owner's Drive): the introduction (established 2014), the two laboratories, the six
   research groups with their supervisors, the "why choose forestry" text, the entry requirements for the BS and the MPhil in Forestry, and eight named
   staff with their titles. The page names no head of department, so none is shown. The old site's notices announce accreditation of the BS Forestry
   by the National Agriculture Education Accreditation Council (NAEAC) in February 2022 and July 2026; only those titles were read.
   EVERYTHING ELSE (vision, mission, highlights, careers, student life, questions and the study plan) is illustrative text for the template that nobody
   in the department has checked: `status: 'draft'`. Replace it, then set `reviewed`. */

const PAGE = 'https://uswat.edu.pk/department-of-agricultural-sciences-and-forestry/'
const NAEAC_2022 =
  'https://uswat.edu.pk/2022/02/national-agriculture-education-accreditation-council-naeac-issued-accreditation-to-university-of-swat-forestry-program/'
const NAEAC_2026 = 'https://uswat.edu.pk/2026/07/forestry-degree-program-earns-naeac-accreditation/'
export const SLUG = 'agricultural-sciences-and-forestry'
export const BS = 'bs-forestry'

const ELIGIBILITY = 'Open merit: HSSC with at least 45% marks (Pre-Medical or Pre-Engineering).'

export const forestry: DepartmentProfile = {
  slug: SLUG,
  status: 'draft',
  shortName: 'Agricultural Sciences and Forestry',
  tagline: 'Forests, water and people in the Hindu Kush, studied among the trees.',
  intro: 'A BS in Forestry, with an MPhil in Forestry also listed, taught in the forests of the Hindu Kush region.',
  hero: officeHero(SLUG),
  banner: officeBanner(SLUG, 'Department of Agricultural Sciences and Forestry. University of Swat. BS Forestry.'),
  tile: officeHero(SLUG, 'Illustration for the Department of Agricultural Sciences and Forestry'),
  levelText: 'BS',
  programmesLede: 'The department’s page lists the BS in Forestry and the MPhil in Forestry; the BS in Forestry is shown here.',
  about: [
    'The Department of Agricultural Sciences and Forestry was established in 2014 to focus on the sustainable management and promotion of forest conservation, for the biological diversity, ecology, recreation, science, education and clean water that forests give to the people of Pakistan and the world.',
    'The department aims to give quality education with relevance, by acquiring highly qualified staff and equipment and facilities for forestry.',
    'The page says the BS Forestry offers quality education, experienced faculty, modern laboratories and field learning in the ecologically rich forests of the Hindu Kush region, with practical skills in forest management, biodiversity conservation, climate change, watershed management, wildlife and environmental sustainability.',
  ],
  vision:
    'To be a centre of learning and research in which forests are managed and conserved for their diversity, water and the benefit of the people of the region and beyond.',
  mission:
    'To give relevant, quality education in forestry, through qualified teachers, laboratories and field learning. To prepare graduates for work in forest management, biodiversity conservation, climate resilience, ecosystem restoration and natural resource management. To carry out research on the forests of the Hindu Kush region.',
  highlights: [
    { icon: 'globe', title: 'Forests as the classroom', text: 'Field courses in the ecologically rich forests of the Hindu Kush region.' },
    { icon: 'flask', title: 'Two named laboratories', text: 'A forestry laboratory and a tree-ring (dendrochronology) laboratory support teaching and research.' },
    { icon: 'search', title: 'Six research groups', text: 'Tree rings, GIS and remote sensing, forest ecology, forest management, forest hydrology, and forestry and wildlife management.' },
    { icon: 'shield', title: 'Climate and conservation', text: 'Climate change, watershed management and biodiversity are part of the teaching.' },
    { icon: 'briefcase', title: 'Wide careers', text: 'Government, academia, research, NGOs and international organisations hire foresters.' },
    { icon: 'cap', title: 'MPhil study', text: 'The department lists an MPhil in Forestry for graduates who want to continue.' },
  ],
  disciplines: [BS],
  labs: [
    {
      title: 'Forestry laboratory',
      text: 'Measurement of trees and wood, the analysis of soil and plant samples, and the work that supports field courses.',
      art: officeHero(SLUG),
      tools: ['Measuring tapes and callipers', 'Soil test kits', 'Sample drying ovens'],
    },
    {
      title: 'Tree ring (dendrochronology) laboratory',
      text: 'Cores from trees are sanded, measured and cross-dated to read past climate and forest history.',
      art: officeHero(BS),
      tools: ['Increment borers', 'Sanding equipment', 'Ring-measuring system'],
    },
    {
      title: 'GIS and remote sensing workroom',
      text: 'Maps and satellite images used to study forest cover and its change. The page lists a research group in this area; this card stands for its workspace.',
      art: officeHero(SLUG),
      tools: ['GIS software', 'GPS receivers', 'Shared workstations'],
    },
    {
      title: 'Field equipment store',
      text: 'The tools students carry into the forest for plots, hydrology and wildlife surveys.',
      art: officeHero(BS),
      tools: ['Clinometers', 'Camera traps', 'Stream-flow gauges'],
    },
  ],
  research: [
    { icon: 'globe', title: 'Tree ring (dendrochronology)', text: 'Reading climate and forest history from the growth rings of trees. Supervisor named on the page: Dr. Sher Shah.', tags: ['Tree rings', 'Climate', 'Forest history'] },
    { icon: 'search', title: 'GIS and remote sensing', text: 'Mapping forest cover and its change with satellite images. Supervisor named on the page: Kaleem Mehmood.', tags: ['GIS', 'Remote sensing', 'Forest cover'] },
    { icon: 'layers', title: 'Forest ecology and forest management', text: 'How forests grow and how they are best managed. Supervisors named on the page: Dr. Naveed Alam (ecology) and Dr. Sultan Muhammad (management).', tags: ['Forest ecology', 'Management', 'Biodiversity'] },
    { icon: 'cloud', title: 'Forest hydrology, forestry and wildlife', text: 'Forests and water, and the management of wildlife. Supervisors named on the page: Dr. Bilal Ahmad (hydrology) and Mr. Hamid Ur Rahman (forestry and wildlife management).', tags: ['Hydrology', 'Watershed', 'Wildlife'] },
  ],
  careers: [
    { icon: 'globe', title: 'Forest officer', text: 'Forest departments and conservation agencies.' },
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Colleges and universities.' },
    { icon: 'flask', title: 'Researcher', text: 'MPhil and PhD study, then research posts.' },
    { icon: 'shield', title: 'NGO and international organisations', text: 'Climate resilience and ecosystem restoration projects.' },
    { icon: 'briefcase', title: 'Natural resource management', text: 'Watershed, wildlife and land-use planning.' },
    { icon: 'briefcase', title: 'Public service', text: 'Competitive examinations and technical posts in the public sector.' },
  ],
  studentLife: [
    { icon: 'users', title: 'Forestry society', text: 'Student-run tree-planting drives, talks and field walks.' },
    { icon: 'globe', title: 'Field camps', text: 'Multi-day camps in the forest for plot measurement and surveys.' },
    { icon: 'book', title: 'Newsletter', text: 'The department publishes “Forest Link”; the page links its first e-newsletter (March to July 2026).' },
    { icon: 'trophy', title: 'Tree-planting day', text: 'Students plant and care for saplings on and near the campus.' },
  ],
  faq: [
    { q: 'Which programmes does the department list?', a: 'The department’s page lists the BS in Forestry and the MPhil in Forestry.' },
    { q: 'What do I need to apply for the BS?', a: `${ELIGIBILITY} This is what the department’s page states.` },
    { q: 'What do I need for the MPhil?', a: 'At least 2.5 out of 4.0 CGPA in a 16-year bachelor’s degree in Forestry, Forestry and Range Management, Wildlife Management, Zoology, Botany, Geology or Environmental Sciences.' },
    { q: 'Is the BS Forestry accredited?', a: 'The university’s notices announce accreditation of the programme by the National Agriculture Education Accreditation Council (NAEAC) in February 2022 and in July 2026. Read the notices for the details.' },
    { q: 'Who leads the department?', a: 'The department’s page does not name a head. It lists eight faculty members.' },
  ],
  peopleTitle: 'Faculty',
  peopleLede: 'The eight staff named on the department’s page, with the titles it gives. The page names no head of department.',
  alumni: ['deodar-growth-rings-on-one-slope', 'forest-cover-change-from-satellite-images', 'stream-flow-and-forest-cover'],
  reference: {
    sources: [
      { label: 'Department of Agricultural Sciences and Forestry page, University of Swat', url: PAGE },
      { label: 'Notice: NAEAC accreditation of the University of Swat forestry programme, February 2022 (title read only)', url: NAEAC_2022 },
      { label: 'Notice: Forestry degree programme earns NAEAC accreditation, July 2026 (title read only)', url: NAEAC_2026 },
    ],
    verifiedAt: '2026-11-06',
    openPoints: [
      'The page names no head of department or chairperson. It gives no seat numbers, fees or intake dates.',
      'The page lists documents (the 5th Board of Studies Forestry 2025, the BS Forestry 2017 scheme and the “Forest Link” newsletter) that are not read here.',
      'The page names Kaleem Mehmood as “Dr.” in the research groups and as “Mr., on study leave” in the staff list; this page shows the staff-list title.',
      'The accreditation notices were read by title only; the dates and terms of accreditation are not confirmed here.',
      'Dr. Zahid Ullah is also named on the Department of Botany page.',
      'The page’s name is “Department of Agricultural Sciences and Forestry”; its programme page names it “Department of Agriculture Sciences & Forestry”.',
      'The BS Forestry programme page on the old site holds only links to scheme-of-studies files, so the study plan, outcomes and careers on the programme page are illustrative.',
      'The vision, mission, highlights, careers and student life on this page are illustrative text for the template, not statements by the department. Staff e-mail addresses on the page are not shown.',
    ],
  },
  team: [
    { id: 'zahid-ullah', name: 'Dr. Zahid Ullah', title: 'Associate Professor', role: 'member' },
    { id: 'naveed-alam', name: 'Dr. Naveed Alam', title: 'Assistant Professor', role: 'member' },
    { id: 'fazal-rabbi', name: 'Dr. Fazal Rabbi', title: 'Assistant Professor', role: 'member' },
    { id: 'bilal-ahmad', name: 'Dr. Bilal Ahmad', title: 'Assistant Professor', role: 'member' },
    { id: 'sher-shah', name: 'Dr. Sher Shah', title: 'Assistant Professor', role: 'member' },
    { id: 'kaleem-mehmood', name: 'Mr. Kaleem Mehmood', title: 'Lecturer (on study leave)', role: 'member' },
    { id: 'sultan-muhammad', name: 'Dr. Sultan Muhammad', title: 'Lecturer', role: 'member' },
    { id: 'hamid-ur-rahman', name: 'Mr. Hamid-Ur-Rahman', title: 'Lecturer', role: 'member' },
  ],
}

export const bsForestry: DisciplineProfile = {
  slug: BS,
  department: SLUG,
  status: 'draft',
  name: 'BS Forestry',
  shortName: 'Forestry',
  eligibility: ELIGIBILITY,
  curriculumLede:
    'This study plan is illustrative until the department confirms its approved scheme of studies. Elective courses are chosen from the tracks below.',
  tagline: 'Manage forests well: for wood, water, wildlife and people.',
  summary: 'Forest ecology, management, hydrology, GIS and remote sensing, and wildlife, with field learning in the Hindu Kush.',
  ...pictures(BS, SLUG, 'BS Forestry. Department of Agricultural Sciences and Forestry, University of Swat.', 'Illustration for BS Forestry'),
  about: [
    'BS Forestry gives students practical skills in forest management, biodiversity conservation, climate change, watershed management, wildlife and environmental sustainability, through research and hands-on training in the forests of the Hindu Kush region.',
    'Demand is growing for people who can work on climate resilience, ecosystem restoration and natural resource management. In the last year students choose electives and carry out a research project with a supervisor.',
  ],
  whyStudy: [
    { icon: 'globe', title: 'Learn in the forest', text: 'Field-based learning in ecologically rich forests.' },
    { icon: 'flask', title: 'Modern laboratories', text: 'A forestry laboratory and a tree-ring laboratory.' },
    { icon: 'shield', title: 'Skills the world needs', text: 'Climate resilience, restoration and resource management.' },
    { icon: 'briefcase', title: 'Varied careers', text: 'Government, academia, research, NGOs and international organisations.' },
  ],
  outcomes: [
    'Describe the structure and growth of forest ecosystems and the trees that make them up.',
    'Measure trees and plots in the field and estimate the stock and growth of a forest.',
    'Use GIS and remote sensing to map forest cover and its change.',
    'Explain how forests affect water and how a watershed is managed.',
    'Plan the management of a forest for wood, water, wildlife and people.',
  ],
  years: [
    year(1, ['Introduction to Forestry', 'General Botany', 'General Chemistry', 'Functional English', 'Islamic Studies'], ['Forest Soils', 'Dendrology I', 'Biostatistics', 'Expository Writing', 'Pakistan Studies']),
    year(2, ['Forest Ecology', 'Dendrology II', 'Forest Mensuration', 'Surveying and Mapping', 'Computer Skills'], ['Silviculture', 'Forest Protection', 'Range Management', 'Field Course I', 'Research Methods']),
    year(3, ['Forest Management', 'GIS and Remote Sensing', 'Wildlife Management', 'Forest Hydrology', 'Agroforestry'], ['Forest Policy and Law', 'Wood Science and Utilisation', 'Climate Change and Forests', 'Field Course II', 'Scientific Writing']),
    year(4, ['Watershed Management', 'Elective I', 'Elective II', 'Research Project I'], ['Forest Economics', 'Elective III', 'Seminar', 'Research Project II']),
  ],
  tracks: [
    { icon: 'globe', title: 'Forest ecology and management', text: 'How forests grow and how they are best managed.' },
    { icon: 'search', title: 'GIS and remote sensing', text: 'Maps and satellite images for forest planning.' },
    { icon: 'cloud', title: 'Hydrology and watersheds', text: 'Forests and the water that flows from them.' },
    { icon: 'shield', title: 'Wildlife and climate', text: 'Habitats, tree rings and a changing climate.' },
  ],
  skills: [
    { group: 'Field', items: ['Tree and plot measurement', 'Surveying', 'Increment coring', 'GPS use'] },
    { group: 'Analysis', items: ['GIS mapping', 'Remote sensing', 'Statistics for ecology'] },
    { group: 'Professional', items: ['Management plans', 'Scientific writing', 'Teamwork', 'Field safety'] },
  ],
  careers: [
    { icon: 'globe', title: 'Forest officer', text: 'Forest departments and conservation agencies.' },
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Colleges and universities.' },
    { icon: 'flask', title: 'Researcher', text: 'MPhil and PhD, then research posts.' },
    { icon: 'shield', title: 'NGO and international organisations', text: 'Climate resilience and restoration projects.' },
    { icon: 'briefcase', title: 'Natural resource management', text: 'Watershed, wildlife and land-use planning.' },
  ],
  faq: [
    { q: 'What do I need to apply?', a: `${ELIGIBILITY} This is what the department’s page states.` },
    ...scienceFaq('Forestry', 4),
  ],
}
