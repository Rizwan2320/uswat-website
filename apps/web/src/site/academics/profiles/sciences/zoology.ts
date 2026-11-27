import { officeBanner, officeHero } from '../../../offices/art'
import type { DepartmentProfile, DisciplineProfile } from '../../types'
import { year } from '../core'

import { pictures, scienceFaq } from './core'

/* Department of Zoology, laid out like the DCST department page (the owner's blueprint, 2026-11-24).
   FROM THE UNIVERSITY'S PAGES, read 2026-11-06 (saved copies on the owner's Drive): the introduction (established 2011; BS Zoology and BS Fisheries),
   the vision, the mission, the four objectives, the programmes listed, and the named staff with their titles. The women's campus section
   (department-of-zoology-2) names five more staff; they are shown here with the tag "Women Campus".
   EVERYTHING ELSE (highlights, laboratories, research areas, careers, student life, questions and the study plan) is illustrative text for the
   template that nobody in the department has checked: `status: 'draft'`. Replace it, then set `reviewed`. */

const PAGE = 'https://uswat.edu.pk/department-of-zoology/'
const PAGE_WC = 'https://uswat.edu.pk/department-of-zoology-2/'
export const SLUG = 'zoology'
export const BS = 'bs-zoology-2'

const WC = 'Women Campus'

export const zoology: DepartmentProfile = {
  slug: SLUG,
  status: 'draft',
  shortName: 'Zoology',
  tagline: 'Animal life, from the cell to the river, studied close to home.',
  intro: 'A BS in Zoology for students who want to understand animals, their behaviour and their habitats, with the BS in Fisheries and an MSc also listed.',
  hero: officeHero(SLUG),
  banner: officeBanner(SLUG, 'Department of Zoology. University of Swat. BS Zoology.'),
  tile: officeHero(SLUG, 'Illustration for the Department of Zoology'),
  levelText: 'BS',
  programmesLede: 'The department’s page lists the BS in Zoology, the BS in Fisheries and an MSc in Zoology; the BS in Zoology is shown here.',
  about: [
    'The Department of Zoology, established in 2011, is one of the prominent departments of the University of Swat. Its aim is to let students get a quality education and do research at their own door.',
    'It offers the four-year BS Zoology and the four-year BS Fisheries. The page says the department receives a high number of applications every year for the programmes it offers.',
    'The courses prepare graduates for institutions at national and international level, and the technical skills they build are meant to meet what the job market asks for.',
  ],
  vision: 'To achieve excellence in the field of animal sciences through high-quality education and research linked to national and international need.',
  mission:
    'To produce well-rounded academics of international standard in animal sciences. The department gives coverage of modern science with the chance to specialise in one or more areas of interest, a broad foundation in basic principles, integrity and responsibility, and research skills that let graduates take part in community development projects. It aims to grow into an outstanding organisation in all areas of its work.',
  highlights: [
    { icon: 'globe', title: 'Animals in their habitats', text: 'River, forest and farmland nearby give students living animals to observe, count and describe.' },
    { icon: 'flask', title: 'Laboratory every year', text: 'Dissection, microscopy and physiology practicals sit beside the lectures.' },
    { icon: 'search', title: 'Many sub-disciplines', text: 'Developmental biology, animal behaviour, parasitology, entomology and fisheries are all taught.' },
    { icon: 'users', title: 'Seminars and mentoring', text: 'A modular course of lectures, seminars and projects, with a supervisor for each student.' },
    { icon: 'rocket', title: 'A final-year research project', text: 'Each student carries out a field or laboratory study and presents the result.' },
    { icon: 'cap', title: 'Paths to further study', text: 'The department’s page also lists an MSc in Zoology.' },
  ],
  disciplines: [BS],
  labs: [
    {
      title: 'General zoology laboratory',
      text: 'Dissection, slide work and the study of animal structure, with weekly practicals.',
      art: officeHero(SLUG),
      tools: ['Compound microscopes', 'Dissection sets', 'Specimen jars'],
    },
    {
      title: 'Entomology and parasitology laboratory',
      text: 'Insects, ticks and worms: how to collect, preserve, identify and count them.',
      art: officeHero(BS),
      tools: ['Stereo microscopes', 'Insect cabinets', 'Staining sets'],
    },
    {
      title: 'Fisheries and aquatic biology laboratory',
      text: 'Water quality, fish biology and the basics of keeping fish in tanks.',
      art: officeHero(SLUG),
      tools: ['Aquaria', 'Water test kits', 'Measuring boards'],
    },
    {
      title: 'Museum and field equipment room',
      text: 'A teaching collection of mounted specimens and the nets, traps and binoculars used on field trips.',
      art: officeHero(BS),
      tools: ['Mounted specimens', 'Sweep nets', 'Binoculars and field guides'],
    },
  ],
  research: [
    { icon: 'globe', title: 'Fish and aquatic life', text: 'Which species live in local waters, and how healthy their habitats are.', tags: ['Fisheries', 'Aquatic biology', 'Water quality'] },
    { icon: 'search', title: 'Parasitology', text: 'Parasites of livestock and wildlife, and how season and place change their numbers.', tags: ['Parasites', 'Livestock', 'Health'] },
    { icon: 'spark', title: 'Entomology', text: 'Insects as pollinators, pests and indicators of a healthy habitat.', tags: ['Insects', 'Pollination', 'Pest control'] },
    { icon: 'brain', title: 'Animal behaviour and development', text: 'How animals behave, grow and respond to their surroundings.', tags: ['Behaviour', 'Developmental biology', 'Ecology'] },
  ],
  careers: [
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'globe', title: 'Wildlife or fisheries officer', text: 'Wildlife and fisheries departments.' },
    { icon: 'flask', title: 'Researcher', text: 'MSc and further study, then research posts.' },
    { icon: 'shield', title: 'Health-sector laboratory work', text: 'Hospitals, diagnostic laboratories and public health programmes.' },
    { icon: 'briefcase', title: 'Agriculture and environment', text: 'Livestock, farming and environmental management.' },
    { icon: 'briefcase', title: 'Public service', text: 'Competitive examinations and technical posts in the public sector.' },
  ],
  studentLife: [
    { icon: 'users', title: 'Zoology society', text: 'Student-run talks, bird walks and quiz nights for first-year students.' },
    { icon: 'globe', title: 'Field trips', text: 'Day trips to rivers and forests to observe and record animals.' },
    { icon: 'book', title: 'Seminar series', text: 'Students present papers and projects to the department.' },
    { icon: 'trophy', title: 'Symposium', text: 'The university’s events list an international symposium on emerging voices in zoology (August 2024); students join such events as helpers and listeners.' },
  ],
  faq: [
    { q: 'Which programmes does the department list?', a: 'The department’s page lists the BS in Zoology, the BS in Fisheries (both four years) and an MSc in Zoology.' },
    { q: 'What do I need to apply for the BS?', a: 'The department’s page does not state its entry requirement. The merit criteria are announced with each intake on the admissions page.' },
    { q: 'Who leads the department?', a: 'The page names Dr. Akhar Rasool, Assistant Professor, as In-Charge.' },
    { q: 'Is there a Women Campus section?', a: 'Yes. The university keeps a separate Women Campus page for Zoology; its five staff are shown on this page with the tag “Women Campus”.' },
    { q: 'Where can I find the latest notices?', a: 'Merit lists, timetables and announcements are published on the university notices page.' },
  ],
  peopleTitle: 'In-charge and faculty',
  peopleLede: 'The staff named on the department’s pages, with the titles they give. Women Campus staff are tagged.',
  alumni: ['fish-species-in-one-river-reach', 'butterflies-of-orchard-and-forest', 'gut-parasites-in-village-goats'],
  reference: {
    sources: [
      { label: 'Department of Zoology page, University of Swat', url: PAGE },
      { label: 'Department of Zoology page for the Women Campus, University of Swat', url: PAGE_WC },
      { label: 'Event: International Symposium on Emerging Voices in Zoology, University of Swat (title read only)', url: 'https://uswat.edu.pk/2024/08/international-symposium-emerging-voices-in-zoology/' },
    ],
    verifiedAt: '2026-11-06',
    openPoints: [
      'The page lists BS Zoology, MSc in Zoology and BS Fisheries (the introduction says both BS programmes run four years). It gives no entry requirement, seat numbers, fees or intake dates.',
      'BS Fisheries has no programme page in the old site’s address list, so it appears here in the text only.',
      'The page calls the unit both a department and a “Centre”.',
      'The page names a senior clerk and a laboratory assistant; support staff are not listed here. Staff e-mail addresses on the page are not shown.',
      'The BS Zoology programme pages on the old site hold only links to scheme-of-studies files, so the study plan, outcomes and careers on the programme page are illustrative.',
      'Highlights, laboratories, research areas, careers and student life on this page are illustrative text for the template, not statements by the department.',
    ],
  },
  team: [
    { id: 'akhar-rasool', name: 'Dr. Akhar Rasool', title: 'Assistant Professor', role: 'head', roleLabel: 'In-Charge' },
    { id: 'tanzil-ur-rahman', name: 'Dr. Tanzil Ur Rahman', title: 'Assistant Professor', role: 'member' },
    { id: 'ghulam-nabi', name: 'Dr. Ghulam Nabi', title: 'Assistant Professor', role: 'member' },
    { id: 'muhammad-yousaf', name: 'Dr. Muhammad Yousaf', title: 'Assistant Professor (Fixed Pay)', role: 'member' },
    { id: 'naseer-ullah', name: 'Dr. Naseer Ullah', title: 'Lecturer', role: 'member' },
    { id: 'rohi-naz', name: 'Ms. Rohi Naz', title: 'Lecturer', role: 'member', qualifications: ['M.Phil in Zoology'] },
    { id: 'shabnam', name: 'Ms. Shabnam', title: 'Lecturer', role: 'member' },
    { id: 'mehreen-riaz', name: 'Dr. Mehreen Riaz', title: 'Assistant Professor', role: 'member', roleLabel: 'Women Campus in-charge' },
    { id: 'ayesha-gul', name: 'Dr. Ayesha Gul', title: 'Assistant Professor', role: 'member', roleLabel: WC },
    { id: 'anwar-sultana', name: 'Ms. Anwar Sultana', title: 'Lecturer and Semester Coordinator', role: 'member', roleLabel: WC },
    { id: 'farhat-sunny', name: 'Ms. Farhat Sunny', title: 'Lecturer', role: 'member', roleLabel: WC },
    { id: 'saba-gul-ayaz', name: 'Ms. Saba Gul Ayaz', title: 'Lecturer', role: 'member', roleLabel: WC },
  ],
}

export const bsZoology: DisciplineProfile = {
  slug: BS,
  department: SLUG,
  status: 'draft',
  name: 'BS Zoology',
  shortName: 'Zoology',
  curriculumLede:
    'This study plan is illustrative until the department confirms its approved scheme of studies. Elective courses are chosen from the tracks below.',
  tagline: 'Understand animals, from the cell to the ecosystem.',
  summary: 'Animal diversity, physiology, ecology, parasitology, entomology and fisheries, with laboratory and field work.',
  ...pictures(BS, SLUG, 'BS Zoology. Department of Zoology, University of Swat.', 'Illustration for BS Zoology'),
  about: [
    'BS Zoology teaches the structure, function, behaviour and diversity of animals, and how they live in their habitats. It has a strong base in laboratory and field practice.',
    'In the last year students choose electives, such as fisheries, entomology or wildlife, and carry out a research project with a supervisor.',
  ],
  whyStudy: [
    { icon: 'globe', title: 'Study animals where they live', text: 'River, forest and farmland give field courses real material.' },
    { icon: 'flask', title: 'Hands-on practicals', text: 'Dissection, microscopy and field sampling are part of every year.' },
    { icon: 'search', title: 'Room to specialise', text: 'Electives let you follow your interest, from parasites to fish.' },
    { icon: 'cap', title: 'A route to further study', text: 'The degree prepares graduates for an MSc or MPhil.' },
  ],
  outcomes: [
    'Describe the structure, function and classification of the main animal groups.',
    'Explain how animals grow, reproduce, behave and interact with their environment.',
    'Collect, preserve and identify animal specimens with proper technique.',
    'Design a field or laboratory study, analyse the data and report the result.',
    'Apply knowledge of animals to health, agriculture and conservation problems.',
  ],
  years: [
    year(1, ['Animal Diversity I (Invertebrates)', 'General Chemistry', 'Cell Biology', 'Functional English', 'Islamic Studies'], ['Animal Diversity II (Chordates)', 'Biostatistics', 'Biochemistry', 'Expository Writing', 'Pakistan Studies']),
    year(2, ['Animal Physiology I', 'Genetics', 'Embryology', 'Ecology', 'Computer Skills'], ['Animal Physiology II', 'Comparative Anatomy', 'Entomology', 'Field Course I', 'Research Methods']),
    year(3, ['Parasitology', 'Animal Behaviour', 'Fish Biology', 'Evolution', 'Immunology'], ['Wildlife Management', 'Molecular Biology', 'Developmental Biology', 'Field Course II', 'Scientific Writing']),
    year(4, ['Aquaculture and Fisheries Management', 'Elective I', 'Elective II', 'Research Project I'], ['Environmental Toxicology', 'Elective III', 'Seminar', 'Research Project II']),
  ],
  tracks: [
    { icon: 'globe', title: 'Fisheries and aquatic biology', text: 'Fish biology, water quality and aquaculture.' },
    { icon: 'search', title: 'Parasitology and entomology', text: 'Parasites, insects and the diseases they carry.' },
    { icon: 'brain', title: 'Behaviour and development', text: 'How animals behave, grow and respond.' },
    { icon: 'shield', title: 'Wildlife and conservation', text: 'Habitats, populations and how to protect them.' },
  ],
  skills: [
    { group: 'Field', items: ['Animal identification', 'Population counts', 'Specimen collection', 'Water sampling'] },
    { group: 'Laboratory', items: ['Dissection', 'Microscopy', 'Staining', 'Basic molecular methods'] },
    { group: 'Professional', items: ['Scientific writing', 'Presenting', 'Teamwork', 'Laboratory safety'] },
  ],
  careers: [
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'globe', title: 'Wildlife or fisheries officer', text: 'Wildlife and fisheries departments.' },
    { icon: 'flask', title: 'Researcher', text: 'MSc, MPhil and PhD, then research posts.' },
    { icon: 'shield', title: 'Laboratory technologist', text: 'Hospitals and diagnostic laboratories.' },
    { icon: 'briefcase', title: 'Agriculture and livestock', text: 'Farm, dairy and veterinary support work.' },
  ],
  faq: [
    { q: 'What do I need to apply?', a: 'The department has not published an entry requirement. The merit criteria are announced with each intake on the admissions page.' },
    ...scienceFaq('Zoology', 4),
  ],
}
