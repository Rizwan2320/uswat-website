import { officeBanner, officeHero } from '../../../offices/art'
import type { DepartmentProfile, DisciplineProfile } from '../../types'
import { year } from '../core'
import { pictures, scienceFaq } from '../sciences/core'

/* Department of Geology, laid out like the DCST department page (the owner's blueprint, 2026-11-24). It replaces the office-style page built on
   2026-11-25 from the same saved copy, so the facts are the ones that page carried.
   FROM THE UNIVERSITY'S PAGE, read 2026-11-06 (saved copy on the owner's Drive): the introduction (functional since 2014, 40 students in the first batch,
   132 credit hours), the mission, the vision, the programme mission, the objectives and expected outcomes, the eligibility, the ten groups of elective
   courses, the five named staff, the address and the department mailbox.
   EVERYTHING ELSE (highlights, laboratories, research areas, careers, student life, questions and the study plan) is illustrative text for the template
   that nobody in the department has checked: `status: 'draft'`. Replace it, then set `reviewed`. */

const PAGE = 'https://uswat.edu.pk/department_of_geology/'
export const SLUG = 'geology'
export const BS = 'bs-geology-2'

const ELIGIBILITY =
  'Intermediate (F.Sc.) or equivalent with at least 45% marks: the science group, another group in which Chemistry, Physics and Mathematics were studied, or a three-year Diploma in Associate Engineering (DAE).'

export const geology: DepartmentProfile = {
  slug: SLUG,
  status: 'draft',
  shortName: 'Geology',
  tagline: 'The earth, its rocks and its resources, read in the field.',
  intro: 'BS Geology, a four-year programme in eight semesters, taught since 2014, with fieldwork at geologically important sites.',
  hero: officeHero(SLUG),
  banner: officeBanner(SLUG, 'Department of Geology. University of Swat.'),
  tile: officeHero(SLUG, 'Illustration for the Department of Geology'),
  levelText: 'BS',
  programmesLede: 'The department offers the BS in Geology.',
  about: [
    'The Department of Geology became functional in 2014 and started the BS Geology programme; for the first batch, the session 2014-2018, it enrolled 40 students. The programme runs four years in eight semesters of sixteen weeks each.',
    'The degree is awarded on completing a minimum of 132 credit hours, including six credits for the project, with a CGPA of at least 2.0. The courses are designed to train professional geologists to apply concepts, principles and best practice in the oil and gas sector, in mining departments and in mineral exploration.',
    'Teaching on campus goes together with fieldwork at geologically important sites of the country; this is the Centre’s primary function.',
  ],
  vision:
    'Building on its strengths, the Centre for Earth & Space Sciences is bridging a link between academia and industry. Such a link will help the academic and professional growth of students and faculty members.',
  mission:
    'To provide state-of-the-art teaching and research facilities that produce professional graduates at the highest national and international levels for academic institutions, oil companies, and mineral exploration and mining. To provide a research-based environment by establishing laboratories with sophisticated research facilities and by building strong collaborations with other renowned institutions.',
  highlights: [
    { icon: 'globe', title: 'Fieldwork at important sites', text: 'Classroom teaching is joined to field visits to geologically important sites of the country.' },
    { icon: 'briefcase', title: 'Training for industry', text: 'Courses prepare geologists for the oil and gas sector, mining departments and mineral exploration.' },
    { icon: 'layers', title: 'Ten groups of electives', text: 'From petroleum geosciences and applied geophysics to environmental geosciences and engineering geology.' },
    { icon: 'flask', title: 'Rocks, minerals and fossils', text: 'Students learn to identify rocks, minerals and fossils by hand and under the microscope.' },
    { icon: 'rocket', title: 'A project in the last year', text: 'Six credit hours of the degree are a project with a supervisor.' },
    { icon: 'cap', title: 'Paths to further study', text: 'Graduates can continue in more specialised areas of geology.' },
  ],
  disciplines: [BS],
  labs: [
    {
      title: 'Mineralogy and petrology laboratory',
      text: 'Hand specimens and thin sections for identifying minerals and rocks.',
      art: officeHero(SLUG),
      tools: ['Polarising microscopes', 'Rock and mineral collections', 'Thin-section sets'],
    },
    {
      title: 'Paleontology and stratigraphy laboratory',
      text: 'Fossils, and the logs and columns that show how rock layers are ordered.',
      art: officeHero(BS),
      tools: ['Fossil collections', 'Stereo microscopes', 'Stratigraphic column kits'],
    },
    {
      title: 'Mapping and structural geology room',
      text: 'Geological maps, cross-sections and the compass and clinometer work behind them.',
      art: officeHero(SLUG),
      tools: ['Brunton compasses', 'Topographic maps', 'Stereonets'],
    },
    {
      title: 'Field equipment store',
      text: 'The hammers, hand lenses and GPS units students carry on field trips.',
      art: officeHero(BS),
      tools: ['Geological hammers', 'GPS units', 'Field notebooks'],
    },
  ],
  research: [
    { icon: 'globe', title: 'Field geology and mapping', text: 'Mapping the rocks and structures of the northern mountains.', tags: ['Mapping', 'Structure', 'Tectonics'] },
    { icon: 'briefcase', title: 'Economic and petroleum geology', text: 'Mineral deposits and the conditions that form oil and gas.', tags: ['Minerals', 'Petroleum', 'Exploration'] },
    { icon: 'gear', title: 'Engineering geology and geophysics', text: 'How ground behaves under buildings, slopes and roads, and how to image it.', tags: ['Slopes', 'Geophysics', 'Hazards'] },
    { icon: 'shield', title: 'Environmental geosciences', text: 'Water, soil and the hazards of a mountain region.', tags: ['Water', 'Hazards', 'Environment'] },
  ],
  careers: [
    { icon: 'briefcase', title: 'Oil and gas geologist', text: 'Exploration and production companies.' },
    { icon: 'gear', title: 'Mining and mineral exploration', text: 'Mining departments and exploration companies.' },
    { icon: 'shield', title: 'Environmental consultant', text: 'Hazard, water and land-use studies.' },
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Colleges and universities.' },
    { icon: 'flask', title: 'Researcher', text: 'Postgraduate study, then research posts.' },
    { icon: 'briefcase', title: 'Public service', text: 'Geological survey and technical posts in the public sector.' },
  ],
  studentLife: [
    { icon: 'users', title: 'Geology society', text: 'Student-run talks, rock quizzes and field walks for first-year students.' },
    { icon: 'globe', title: 'Field camps', text: 'Multi-day camps to map and sample rocks.' },
    { icon: 'spark', title: 'Industry talks', text: 'Visiting geologists speak about careers in the field.' },
    { icon: 'trophy', title: 'Earth science day', text: 'Specimens and maps shown to schools in the district.' },
  ],
  faq: [
    { q: 'Which programme does the department offer?', a: 'BS Geology, a four-year programme in eight semesters.' },
    { q: 'What do I need to apply?', a: ELIGIBILITY },
    { q: 'How many credit hours is the degree?', a: 'The department’s page gives a minimum of 132 credit hours, including six for the project, and a CGPA of at least 2.0; its notes also mention 130 and 139. Which applies is not stated there.' },
    { q: 'Who leads the department?', a: 'The page names Mr. Adnan Khan, Lecturer, as In-charge.' },
    { q: 'How do I contact the department?', a: 'The page gives the department mailbox cess@uswat.edu.pk and the address Main Campus at Charbagh.' },
  ],
  peopleTitle: 'In-charge and faculty',
  peopleLede: 'The five staff named on the department’s page, with the titles it gives.',
  alumni: ['rock-units-along-a-road-cut', 'slope-stability-near-a-village', 'heavy-minerals-in-river-sand'],
  reference: {
    sources: [{ label: 'Department of Geology page, University of Swat', url: PAGE }],
    verifiedAt: '2026-11-06',
    emails: ['cess@uswat.edu.pk'],
    openPoints: [
      'The page gives the credit hours needed for the degree three ways: a minimum of 132 in the introduction, 130 as the HEC minimum in a note, and “increased up to 139” after the HEC revised curriculum of 2013. Which applies is not stated.',
      'The vision text names the “Centre for Earth & Space Sciences”, and the contact address is cess@; the page calls the unit both the Department of Geology and the Centre.',
      'The page gives no phone number and no message from the head of the department. Its address is Main Campus at Charbagh.',
      'The page lists the courses, codes and credit hours of every semester; they are on the university’s page and are not reproduced here. The study plan on the programme page is illustrative.',
      'Highlights, laboratories, research areas, careers and student life on this page are illustrative text for the template, not statements by the department.',
    ],
  },
  team: [
    { id: 'adnan-khan', name: 'Mr. Adnan Khan', title: 'Lecturer and In-charge', role: 'head', roleLabel: 'In-charge' },
    { id: 'zaheen-ullah', name: 'Dr. Zaheen Ullah', title: 'Assistant Professor', role: 'member' },
    { id: 'subhan-ullah', name: 'Dr. Subhan Ullah', title: 'Lecturer', role: 'member' },
    { id: 'muhammad-ibrar', name: 'Mr. Muhammad Ibrar', title: 'Lecturer', role: 'member' },
    { id: 'muhammad-idrees', name: 'Mr. Muhammad Idrees', title: 'Lecturer', role: 'member' },
  ],
}

export const bsGeology: DisciplineProfile = {
  slug: BS,
  department: SLUG,
  status: 'draft',
  name: 'BS Geology',
  shortName: 'Geology',
  eligibility: ELIGIBILITY,
  curriculumLede:
    'This study plan is illustrative: the department’s page lists the real courses, codes and credit hours on the university’s site. Elective courses are chosen from the ten groups below.',
  tagline: 'Read the earth: its rocks, its resources and its hazards.',
  summary: 'Mineralogy, stratigraphy, structure, economic and petroleum geology, with fieldwork and a project.',
  ...pictures(BS, SLUG, 'BS Geology. Department of Geology, University of Swat.', 'Illustration for BS Geology'),
  about: [
    'BS Geology promotes scientific knowledge about the earth and its mineral resources, and builds the knowledge and skills students need to start careers as geologists in energy, mineral resources and environmental consulting, or to continue in more specialised areas of geology.',
    'It is a four-year programme of eight semesters, with fieldwork at geologically important sites and a project worth six credit hours.',
  ],
  whyStudy: [
    { icon: 'globe', title: 'Learn in the field', text: 'Campus teaching goes with fieldwork at important sites.' },
    { icon: 'briefcase', title: 'Industry links', text: 'The department aims to link academia and industry.' },
    { icon: 'layers', title: 'Choose your direction', text: 'Ten groups of electives, from petroleum to environmental geosciences.' },
    { icon: 'cap', title: 'Room to specialise', text: 'Graduates can continue to more specialised study.' },
  ],
  outcomes: [
    'Explain the importance of geology and its applicability in relevant fields.',
    'Gain broad fundamental geological knowledge, including rock, mineral and fossil identification.',
    'Perform field-based research and produce accurate geologic maps and subsurface models.',
    'Analyze data and solve geological problems.',
  ],
  years: [
    year(1, ['Physical Geology', 'General Chemistry', 'Calculus', 'Functional English', 'Islamic Studies'], ['Crystallography and Mineralogy', 'General Physics', 'Geological Drawing', 'Expository Writing', 'Pakistan Studies']),
    year(2, ['Igneous Petrology', 'Structural Geology', 'Paleontology', 'Computer Skills', 'Statistics'], ['Sedimentology', 'Metamorphic Petrology', 'Stratigraphy', 'Field Course I', 'Research Methods']),
    year(3, ['Economic Geology', 'Engineering Geology', 'Geophysics', 'Remote Sensing and GIS', 'Hydrogeology'], ['Petroleum Geology', 'Tectonics', 'Environmental Geology', 'Field Course II', 'Scientific Writing']),
    year(4, ['Geological Mapping', 'Elective I', 'Elective II', 'Project I'], ['Elective III', 'Elective IV', 'Seminar', 'Project II']),
  ],
  tracks: [
    { icon: 'layers', title: 'Mineralogy and petrology', text: 'Minerals, and the rocks they make.' },
    { icon: 'briefcase', title: 'Economic and petroleum geology', text: 'Mineral deposits, oil and gas.' },
    { icon: 'gear', title: 'Engineering geology and geophysics', text: 'Ground behaviour and how to image it.' },
    { icon: 'globe', title: 'Environmental geosciences', text: 'Water, hazards and land use.' },
    { icon: 'search', title: 'Paleontology and stratigraphy', text: 'Fossils and the order of rock layers.' },
    { icon: 'spark', title: 'Structure, tectonics and neotectonics', text: 'How mountains form and move.' },
  ],
  skills: [
    { group: 'Field', items: ['Geological mapping', 'Compass and clinometer work', 'Sampling', 'GPS use'] },
    { group: 'Laboratory', items: ['Mineral and rock identification', 'Microscopy', 'Fossil identification'] },
    { group: 'Professional', items: ['Report writing', 'GIS and remote sensing', 'Teamwork', 'Field safety'] },
  ],
  careers: [
    { icon: 'briefcase', title: 'Oil and gas geologist', text: 'Exploration and production companies.' },
    { icon: 'gear', title: 'Mining and mineral exploration', text: 'Mining departments and exploration companies.' },
    { icon: 'shield', title: 'Environmental consultant', text: 'Hazard, water and land-use studies.' },
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Colleges and universities.' },
    { icon: 'briefcase', title: 'Public service', text: 'Geological survey and technical posts.' },
  ],
  faq: [{ q: 'What do I need to apply?', a: ELIGIBILITY }, ...scienceFaq('Geology', 4)],
}
