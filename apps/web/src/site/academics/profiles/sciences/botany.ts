import { officeBanner, officeHero } from '../../../offices/art'
import type { DepartmentProfile, DisciplineProfile } from '../../types'
import { year } from '../core'

import { pictures, scienceFaq } from './core'

/* Department of Botany, laid out like the DCST department page (the owner's blueprint, 2026-11-24).
   FROM THE UNIVERSITY'S PAGES, read 2026-11-06 (saved copies on the owner's Drive): the introduction, the vision, the four objectives, the research
   emphasis, the programmes listed (BS, MPhil, PhD), the department office line, and the named staff with their titles. The women's campus section
   (department-of-botany-2) names four more lecturers; they are shown here with the tag "Women Campus".
   EVERYTHING ELSE (highlights, laboratories, careers, student life, questions and the study plan) is illustrative text for the template that nobody
   in the department has checked: `status: 'draft'`. Replace it, then set `reviewed`. */

const PAGE = 'https://uswat.edu.pk/department-of-botany/'
const PAGE_WC = 'https://uswat.edu.pk/department-of-botany-2/'
export const SLUG = 'botany'
export const BS = 'bs-botany-2'

const WC = 'Women Campus'

export const botany: DepartmentProfile = {
  slug: SLUG,
  status: 'draft',
  shortName: 'Botany',
  tagline: 'Plants, their diversity and their future, studied where the mountains meet the valley.',
  intro: 'A BS in Botany for students who want to study plant life, from the forests of the north to the gene, with MPhil and PhD study listed.',
  hero: officeHero(SLUG),
  banner: officeBanner(SLUG, 'Department of Botany. University of Swat. BS Botany.'),
  tile: officeHero(SLUG, 'Illustration for the Department of Botany'),
  levelText: 'BS',
  programmesLede: 'The department’s page lists the BS, MPhil and PhD in Botany; the BS in Botany is shown here.',
  about: [
    'Botany is the scientific study of plants. Plants give us oxygen, shelter, food, fibre, fuel and medicine, yet a growing population and the demand for economic growth have put the diversity of plants at risk.',
    'The Department of Botany was set up to give interdisciplinary teaching and research in plant sciences, and to apply what is learned to the sustainable economic growth of a society that lives in one of the richest biodiversity zones of the country.',
    'Teaching follows the principles that hold from the large scale to the microscopic across living systems, and the department builds links and joint ventures with institutions in Pakistan and abroad.',
  ],
  vision:
    'To establish an internationally acclaimed Department of Botany that advances teaching, research and the development of skilled people, offers quality education to meet national and global challenges, and works for the restoration of the natural resources of the country, and of the region in particular.',
  mission:
    'To prepare an outstanding faculty of researchers in botany and biodiversity who help conserve the nation’s natural resources. To carry out studies that identify natural resources and wildlife and to plan the better use of indigenous plant resources. To keep teaching in step with current scientific interest in the living side of environmental problems. To contribute to national policies that protect living organisms and care for the environment, with solutions at local and international levels.',
  highlights: [
    { icon: 'globe', title: 'A mountain flora on the doorstep', text: 'Forests, pastures and orchards within a day’s travel give students living material for field courses.' },
    { icon: 'flask', title: 'From the field to the molecule', text: 'Courses move from plant identification and ecology to cell biology and molecular methods.' },
    { icon: 'book', title: 'Herbarium practice', text: 'Students collect, press, identify and label specimens to the standard a herbarium needs.' },
    { icon: 'shield', title: 'Conservation focus', text: 'Rare, endangered and endemic plants and their habitats are a thread through the degree.' },
    { icon: 'rocket', title: 'A final-year research project', text: 'Each student carries out a field or laboratory study with a supervisor and presents the result.' },
    { icon: 'cap', title: 'Paths to further study', text: 'The department lists MPhil and PhD programmes for graduates who want to continue.' },
  ],
  disciplines: [BS],
  labs: [
    {
      title: 'Plant taxonomy and herbarium room',
      text: 'Where pressed specimens are identified, mounted and stored, and where a physical and electronic herbarium is built.',
      art: officeHero(SLUG),
      tools: ['Herbarium cabinets', 'Stereo microscopes', 'Plant presses'],
    },
    {
      title: 'Plant physiology and ecology laboratory',
      text: 'Experiments on growth, water, light and soil, and the measurements an ecological survey needs.',
      art: officeHero(BS),
      tools: ['pH and conductivity meters', 'Spectrophotometer', 'Soil sampling kits'],
    },
    {
      title: 'Molecular and tissue culture laboratory',
      text: 'DNA work and growing plants from small pieces of tissue, for conservation and plant improvement.',
      art: officeHero(SLUG),
      tools: ['PCR machine', 'Gel electrophoresis', 'Laminar-flow cabinet'],
    },
    {
      title: 'Alpine botanical garden (planned)',
      text: 'The department’s page says it plans an Alpine Botanical Garden and Mountain Herbarium; this card stands for it until it exists.',
      art: officeHero(BS),
      tools: ['Field notebooks', 'GPS units', 'Survey quadrats'],
    },
  ],
  research: [
    { icon: 'globe', title: 'Forest ecology and plant diversity', text: 'Counting and describing the plants of forest ecosystems in the north of Pakistan, and keeping an inventory of them.', tags: ['Forest ecosystems', 'Biodiversity', 'Conservation'] },
    { icon: 'book', title: 'Plant genetic resources and herbaria', text: 'Surveying the region’s plant genetic resources, naming them and recording them in physical and electronic herbaria.', tags: ['Taxonomy', 'Herbarium', 'Genetic resources'] },
    { icon: 'flask', title: 'Molecular characterisation', text: 'Using DNA to describe rare, endangered and endemic plants, and to trace how species are related.', tags: ['Molecular phylogeny', 'Rare plants', 'Gene bank'] },
    { icon: 'spark', title: 'Plant improvement and microbes', text: 'Finding genes for useful traits and studying the microbial life that plants depend on.', tags: ['Plant improvement', 'Microbial diversity', 'Agro-forestry'] },
  ],
  careers: [
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'flask', title: 'Researcher', text: 'MPhil and PhD study, then research posts.' },
    { icon: 'globe', title: 'Conservation or forestry officer', text: 'Forest, wildlife and environment departments.' },
    { icon: 'briefcase', title: 'Agriculture and plant products', text: 'Seed, nursery and herbal-product enterprises.' },
    { icon: 'shield', title: 'Environmental consultant', text: 'Impact studies and biodiversity surveys.' },
    { icon: 'briefcase', title: 'Public service', text: 'Competitive examinations and technical posts in the public sector.' },
  ],
  studentLife: [
    { icon: 'users', title: 'Botany society', text: 'Student-run field walks, plant quizzes and talks for first-year students.' },
    { icon: 'globe', title: 'Field excursions', text: 'Day trips to forests and pastures to collect and identify plants.' },
    { icon: 'book', title: 'Herbarium volunteers', text: 'Students help mount and label specimens for the department collection.' },
    { icon: 'trophy', title: 'Biodiversity day', text: 'Posters and plant displays for schools and visitors.' },
  ],
  faq: [
    { q: 'Which programmes does the department list?', a: 'The department’s page lists the BS, MPhil and PhD in Botany, and a combined BS/MPhil/PhD pathway.' },
    { q: 'What do I need to apply for the BS?', a: 'The department’s page does not state its entry requirement. The merit criteria are announced with each intake on the admissions page.' },
    { q: 'Who leads the department?', a: 'The page names Dr. Ahmad Ali, Associate Professor and Director.' },
    { q: 'Is there a Women Campus section?', a: 'Yes. The university keeps a separate Women Campus page for Botany; its four lecturers are shown on this page with the tag “Women Campus”.' },
    { q: 'How do I reach the department office?', a: 'The page gives the office line 0946-920835 and the address: Ground Floor, Academic Block-C.' },
  ],
  peopleTitle: 'Director and faculty',
  peopleLede: 'The staff named on the department’s pages, with the titles they give. Women Campus staff are tagged.',
  alumni: ['medicinal-plants-sold-in-local-markets', 'pine-forest-understorey-herbarium', 'salt-stress-and-wheat-germination'],
  reference: {
    sources: [
      { label: 'Department of Botany page, University of Swat', url: PAGE },
      { label: 'Department of Botany page for the Women Campus, University of Swat', url: PAGE_WC },
    ],
    verifiedAt: '2026-11-06',
    phones: [{ label: 'Department office (Senior Clerk)', number: '0946-920835' }],
    openPoints: [
      'The page lists BS, MPhil, PhD and a BS/MPhil/PhD pathway and links an “Approval of Board of Studies” document that is not read here. It gives no entry requirement, seat numbers, fees or intake dates.',
      'The page names Dr. Shazia Sakhi as Associate Professor; the Women Campus page calls her Assistant Professor and In-Charge. This page uses the first title.',
      'The page says the department plans an “Alpine Botanical Garden, Mountain Herbarium and Biodiversity Conservation Society”. Nothing says it is built.',
      'The BS Botany programme pages on the old site hold only links to scheme-of-studies files, so the study plan, outcomes and careers on the programme page are illustrative.',
      'Highlights, laboratories, careers and student life on this page are illustrative text for the template, not statements by the department. Research areas follow the emphasis the page states; their descriptions are illustrative.',
      'The page also names a senior clerk; support staff are not listed here. Staff e-mail addresses on the page are not shown.',
    ],
  },
  team: [
    { id: 'ahmad-ali', name: 'Dr. Ahmad Ali', title: 'Associate Professor and Director', role: 'head', roleLabel: 'Director' },
    { id: 'hassan-sher', name: 'Dr. Hassan Sher', title: 'Professor', role: 'member', qualifications: ['SAARC Gold Medalist'] },
    { id: 'zahid-ullah', name: 'Dr. Zahid Ullah', title: 'Associate Professor', role: 'member' },
    { id: 'shazia-sakhi', name: 'Dr. Shazia Sakhi', title: 'Associate Professor', role: 'member', roleLabel: 'Women Campus in-charge' },
    { id: 'junaid-khan', name: 'Dr. Junaid Khan', title: 'Assistant Professor', role: 'member' },
    { id: 'zakia-ahmad', name: 'Dr. Zakia Ahmad', title: 'Assistant Professor', role: 'member' },
    { id: 'muhammad-adil', name: 'Dr. Muhammad Adil', title: 'Assistant Professor', role: 'member' },
    { id: 'shazia', name: 'Dr. Shazia', title: 'Lecturer', role: 'member' },
    { id: 'shahid-hussain', name: 'Dr. Shahid Hussain', title: 'Lecturer', role: 'member' },
    { id: 'naheed-fazal', name: 'Ms. Naheed Fazal', title: 'Lecturer', role: 'member', roleLabel: WC },
    { id: 'sabrina-shahid', name: 'Ms. Sabrina Shahid', title: 'Lecturer', role: 'member', roleLabel: WC },
    { id: 'shahida-bibi', name: 'Ms. Shahida Bibi', title: 'Lecturer', role: 'member', roleLabel: WC },
    { id: 'rehana-kausar', name: 'Ms. Rehana Kausar', title: 'Lecturer', role: 'member', roleLabel: WC },
  ],
}

export const bsBotany: DisciplineProfile = {
  slug: BS,
  department: SLUG,
  status: 'draft',
  name: 'BS Botany',
  shortName: 'Botany',
  curriculumLede:
    'This study plan is illustrative until the department confirms its approved scheme of studies. Elective courses are chosen from the tracks below.',
  tagline: 'Know the plants of the mountains, and how to keep them.',
  summary: 'Plant diversity, ecology, physiology and molecular botany, with field and laboratory work in every year.',
  ...pictures(BS, SLUG, 'BS Botany. Department of Botany, University of Swat.', 'Illustration for BS Botany'),
  about: [
    'BS Botany teaches the structure, function, diversity and ecology of plants, from algae and fungi to flowering plants, with a strong emphasis on the flora of the northern mountains.',
    'Field courses and laboratory practice run alongside lectures. In the last year students choose electives and carry out a research project with a supervisor.',
  ],
  whyStudy: [
    { icon: 'globe', title: 'Learn in a living laboratory', text: 'Forests and pastures nearby give field courses real material.' },
    { icon: 'flask', title: 'Field and laboratory skills', text: 'Identification, measurement and molecular methods are taught side by side.' },
    { icon: 'shield', title: 'Conservation matters', text: 'Plant diversity is under pressure, and trained botanists are needed to protect it.' },
    { icon: 'cap', title: 'A route to MPhil and PhD', text: 'The department lists postgraduate programmes in Botany.' },
  ],
  outcomes: [
    'Identify and classify common plants and describe their structure and life cycles.',
    'Explain how plants grow, take up water and nutrients, and respond to their environment.',
    'Design and carry out a vegetation survey and analyse the results.',
    'Use basic molecular and tissue culture methods in the laboratory.',
    'Write a scientific report and present findings clearly.',
  ],
  years: [
    year(1, ['Diversity of Plants I', 'General Chemistry', 'Cell Biology', 'Functional English', 'Islamic Studies'], ['Diversity of Plants II', 'Plant Morphology and Anatomy', 'Biostatistics', 'Expository Writing', 'Pakistan Studies']),
    year(2, ['Plant Taxonomy', 'Mycology and Plant Pathology', 'Biochemistry', 'Genetics', 'Computer Skills'], ['Plant Ecology', 'Plant Physiology', 'Algae and Bryophytes', 'Field Course I', 'Research Methods']),
    year(3, ['Molecular Biology', 'Plant Tissue Culture', 'Ethnobotany', 'Environmental Botany', 'Plant Breeding'], ['Phytogeography and Conservation', 'Plant Biotechnology', 'Palynology', 'Field Course II', 'Scientific Writing']),
    year(4, ['Plant Resources and Economic Botany', 'Elective I', 'Elective II', 'Research Project I'], ['Plant Molecular Phylogeny', 'Elective III', 'Seminar', 'Research Project II']),
  ],
  tracks: [
    { icon: 'globe', title: 'Ecology and conservation', text: 'Vegetation survey, biodiversity and the care of habitats.' },
    { icon: 'book', title: 'Taxonomy and herbarium science', text: 'Naming, classifying and recording plants.' },
    { icon: 'flask', title: 'Molecular and biotechnology', text: 'DNA, tissue culture and plant improvement.' },
    { icon: 'spark', title: 'Ethnobotany and plant resources', text: 'How people use plants for food, medicine and materials.' },
  ],
  skills: [
    { group: 'Field', items: ['Plant identification', 'Vegetation survey', 'Herbarium preparation', 'GPS use'] },
    { group: 'Laboratory', items: ['Microscopy', 'Tissue culture', 'DNA extraction', 'Spectrophotometry'] },
    { group: 'Professional', items: ['Scientific writing', 'Presenting', 'Teamwork', 'Laboratory safety'] },
  ],
  careers: [
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'flask', title: 'Researcher', text: 'MPhil and PhD, then research posts.' },
    { icon: 'globe', title: 'Conservation officer', text: 'Forest, wildlife and environment departments.' },
    { icon: 'briefcase', title: 'Nursery and seed enterprise', text: 'Growing and testing plants for sale.' },
    { icon: 'shield', title: 'Environmental consultant', text: 'Biodiversity surveys and impact studies.' },
  ],
  faq: [
    { q: 'What do I need to apply?', a: 'The department has not published an entry requirement. The merit criteria are announced with each intake on the admissions page.' },
    ...scienceFaq('Botany', 4),
  ],
}
