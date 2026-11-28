import { officeBanner, officeHero } from '../../../offices/art'
import type { DepartmentProfile, DisciplineProfile } from '../../types'
import { year } from '../core'
import { pictures, scienceFaq } from '../sciences/core'

/* Department of Environmental Sciences, laid out like the DCST department page (the owner's blueprint, 2026-11-24). It replaces the office-style page
   built on 2026-11-25 from the same saved copy, so the facts are the ones that page carried.
   FROM THE UNIVERSITY'S PAGE, read 2026-11-06 (saved copy on the owner's Drive): the introduction (established 2012), the vision, the three mission lines,
   the programmes offered, the research groups, the eight named staff and the address.
   EVERYTHING ELSE (highlights, laboratories, careers, student life, questions and the study plan) is illustrative text for the template that nobody in
   the department has checked: `status: 'draft'`. Replace it, then set `reviewed`. */

const PAGE = 'https://uswat.edu.pk/department-of-environmental-sciences/'
export const SLUG = 'environmental-sciences'
export const BS = 'bs-environmental-sciences'

export const environmentalSciences: DepartmentProfile = {
  slug: SLUG,
  status: 'draft',
  shortName: 'Environmental Sciences',
  tagline: 'Understand the environment, predict its change and help look after it.',
  intro: 'Established in 2012, with BS, MS/MPhil and PhD programmes and a one-year postgraduate diploma in geomatics.',
  hero: officeHero(SLUG),
  banner: officeBanner(SLUG, 'Department of Environmental Sciences. University of Swat.'),
  tile: officeHero(SLUG, 'Illustration for the Department of Environmental Sciences'),
  levelText: 'BS',
  programmesLede:
    'The page lists BS Environmental Sciences, BS Disaster Preparedness and Climate Change, an MS/MPhil and PhD, and a one-year postgraduate diploma in Geomatics; the BS in Environmental Sciences is shown here.',
  about: [
    'The Department of Environmental Sciences was established in 2012 to give students the knowledge, understanding and skills to preserve, protect and rehabilitate the local and global environment and to build a sustainable future. It aims to prepare graduates to understand environmental systems, predict environmental change and take part in managing the environment.',
    'Its overall goal is to become a leading institution in environmental sciences, judged by the quality of its graduates, the number of research scholars, the quality of its research and its services to the community and the public sector in analyzing and managing environmental issues.',
    'Research is basic, problem-oriented and solution-driven, from natural resource management, pollution control and water and wastewater treatment to biotechnology, toxicology, environmental economics, environmental assessment and climate change. An environmental laboratory and a GIS laboratory are being established.',
  ],
  vision:
    'To pioneer a new generation of research and teaching methods that understand the fundamental processes behind environmental pollution and natural resource degradation and arrive at solutions to pressing societal problems, and to prepare graduates who understand environmental systems, predict environmental change, take part in managing the environment and contribute to a sustainable society.',
  mission:
    'To provide formal education and research in environmental and conservation sciences that bring education standards up to the international level. To provide a good research environment for publishing results in journals of international repute. To provide professional services such as special training, analyses, surveys and consultancies to industry, NGOs, community-based organisations, engineering firms and others.',
  highlights: [
    { icon: 'globe', title: 'Systems and change', text: 'Students learn how physical processes and ecosystems interact, and how to predict change.' },
    { icon: 'flask', title: 'Laboratory and GIS', text: 'An environmental laboratory for physicochemical and biological analysis and a GIS laboratory are being established.' },
    { icon: 'shield', title: 'Law and ethics', text: 'Graduates know the legislative and ethical framework in which environmental scientists work.' },
    { icon: 'search', title: 'Problem-oriented research', text: 'Research is aimed at solutions to pressing problems of the region.' },
    { icon: 'briefcase', title: 'Services to the community', text: 'The mission includes training, analyses, surveys and consultancies for industry and the public sector.' },
    { icon: 'cap', title: 'Degrees from BS to PhD', text: 'The department lists BS, MS/MPhil, PhD and a one-year diploma in Geomatics.' },
  ],
  disciplines: [BS],
  labs: [
    {
      title: 'Environmental analysis laboratory',
      text: 'Physicochemical and biological analysis of water, soil and air samples. The page says it is being established.',
      art: officeHero(SLUG),
      tools: ['pH and conductivity meters', 'Spectrophotometer', 'Sampling kits'],
    },
    {
      title: 'GIS and remote sensing laboratory',
      text: 'Maps and satellite images for land-use, climate and hazard studies. The page says it is being established.',
      art: officeHero(BS),
      tools: ['GIS software', 'GPS receivers', 'Shared workstations'],
    },
    {
      title: 'Microbiology and bioremediation laboratory',
      text: 'Work on microbes and plants that clean contaminated land and water.',
      art: officeHero(SLUG),
      tools: ['Incubators', 'Autoclave', 'Laminar-flow cabinet'],
    },
    {
      title: 'Field equipment store',
      text: 'The kits students take to rivers, farms and industrial sites.',
      art: officeHero(BS),
      tools: ['Water test kits', 'Soil augers', 'Air quality monitors'],
    },
  ],
  research: [
    { icon: 'flask', title: 'Plastic, microbes and biogeochemical cycling', text: 'Bioremediation of contaminated environments with local plants and microbes (bacteria, algae and fungi) that tolerate or accumulate contaminants.', tags: ['Bioremediation', 'Microbes', 'Plastics'] },
    { icon: 'shield', title: 'Ecological risk assessment and management', text: 'Judging the risk that pollutants pose to ecosystems and planning how to manage it.', tags: ['Risk assessment', 'Ecology', 'Management'] },
    { icon: 'globe', title: 'Forests, water and land resources', text: 'The page lists forests, water and land resources management, GIS mapping and remote-sensing land-use change, biodiversity conservation and glacial studies.', tags: ['GIS', 'Biodiversity', 'Glaciers'] },
    { icon: 'cloud', title: 'Climate change and flood hydrology', text: 'Climate change, flood hydrology, glacial lake outburst floods and the effects of climate change on agriculture.', tags: ['Climate', 'Floods', 'Agriculture'] },
  ],
  careers: [
    { icon: 'shield', title: 'Environmental officer', text: 'Environmental protection agencies and industry.' },
    { icon: 'briefcase', title: 'Environmental consultant', text: 'Impact assessments, audits and surveys.' },
    { icon: 'globe', title: 'Climate and disaster-risk work', text: 'Government and non-profit programmes.' },
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Colleges and universities.' },
    { icon: 'flask', title: 'Researcher', text: 'MS, MPhil and PhD, then research posts.' },
    { icon: 'briefcase', title: 'Public service', text: 'Competitive examinations and technical posts.' },
  ],
  studentLife: [
    { icon: 'users', title: 'Environment society', text: 'Student-run clean-up drives, talks and tree planting.' },
    { icon: 'globe', title: 'Field trips', text: 'Visits to rivers, farms and industrial sites for sampling.' },
    { icon: 'spark', title: 'Awareness events', text: 'Campaigns on waste, water and climate for schools and the district.' },
    { icon: 'trophy', title: 'Environment day', text: 'Posters and demonstrations for visitors.' },
  ],
  faq: [
    { q: 'Which programmes does the department list?', a: 'BS Environmental Sciences, BS Disaster Preparedness and Climate Change, a graduate programme (MS/MPhil and PhD) and a one-year postgraduate diploma in Geomatics (GIS and RS).' },
    { q: 'What do I need to apply?', a: 'The department’s page does not state an entry requirement. The merit criteria are announced with each intake on the admissions page.' },
    { q: 'Who leads the department?', a: 'The page names Dr. Muhammad Qasim, Professor and Chairperson, who is also Pro Vice Chancellor.' },
    { q: 'Where is the department?', a: 'In Academic Block-A of the university.' },
    { q: 'Where can I find the latest notices?', a: 'Merit lists, timetables and announcements are published on the university notices page.' },
  ],
  peopleTitle: 'Chairperson and faculty',
  peopleLede: 'The eight staff named on the department’s page, with the titles and qualifications it gives.',
  alumni: ['river-water-quality-below-a-town', 'household-waste-survey-in-a-neighbourhood', 'a-plant-that-takes-up-heavy-metals'],
  reference: {
    sources: [{ label: 'Department of Environmental Sciences page, University of Swat', url: PAGE }],
    verifiedAt: '2026-11-06',
    openPoints: [
      'The page lists the programmes twice with different names: “BS Disaster Preparedness and Climate Change” in one list and “BS Climate Change” in the other. The first list is shown.',
      'One of the four mission lines on the page is cut off mid-sentence, so it is not shown.',
      'The page gives no department phone number or e-mail address, only personal addresses of staff, which are not shown here.',
      'The MPhil in Environmental Biotechnology and Bioremediation appears next to Dr. Muhammad Ayaz in the research group text, while his staff entry gives no degree; it is shown as the page words it.',
      'BS Disaster Preparedness and Climate Change and the Geomatics diploma are named in the text only: no page for them is in the old site’s address list.',
      'The study plan, outcomes and careers on the programme page, and the highlights, laboratories, careers and student life on this page, are illustrative text for the template, not statements by the department.',
    ],
  },
  team: [
    {
      id: 'muhammad-qasim',
      name: 'Dr. Muhammad Qasim',
      title: 'Professor and Chairperson; Pro Vice Chancellor',
      role: 'head',
      roleLabel: 'Chairperson',
      qualifications: ['PhD, University of Leeds, UK', 'Post-doctorate, Hokkaido University, Japan'],
    },
    { id: 'javeed-nawab', name: 'Dr. Javeed Nawab', title: 'Professor', role: 'member' },
    { id: 'kifayatullah-khan', name: 'Dr. Kifayatullah Khan', title: 'Associate Professor', role: 'member', qualifications: ['PhD in Environmental Sciences, University of Peshawar'] },
    { id: 'sanaullah', name: 'Dr. Sanaullah', title: 'Assistant Professor', role: 'member', qualifications: ['MS in Environmental Sciences, COMSATS University, Abbottabad'] },
    { id: 'anwarzeb-khan', name: 'Dr. Anwarzeb Khan', title: 'Assistant Professor', role: 'member' },
    { id: 'wajid-rashid', name: 'Dr. Wajid Rashid', title: 'Lecturer', role: 'member', qualifications: ['PhD in Environmental Sciences, Beijing Normal University, China'] },
    { id: 'muhammad-ayaz', name: 'Dr. Muhammad Ayaz', title: 'Lecturer', role: 'member', qualifications: ['MPhil in Environmental Biotechnology and Bioremediation'] },
    { id: 'khalil-ur-rahman', name: 'Dr. Khalil Ur Rahman', title: 'Adjunct faculty; Associate Professor, Shandong University, Jinan, China', role: 'member' },
  ],
}

export const bsEnvironmentalSciences: DisciplineProfile = {
  slug: BS,
  department: SLUG,
  status: 'draft',
  name: 'BS Environmental Sciences',
  shortName: 'Environmental Sciences',
  curriculumLede:
    'This study plan is illustrative until the department confirms its approved scheme of studies. Elective courses are chosen from the tracks below.',
  tagline: 'Protect, rehabilitate and manage the environment.',
  summary: 'Environmental systems, pollution, resource management and climate change, with laboratory, GIS and field work.',
  ...pictures(BS, SLUG, 'BS Environmental Sciences. Department of Environmental Sciences, University of Swat.', 'Illustration for BS Environmental Sciences'),
  about: [
    'BS Environmental Sciences gives a broad foundation of science-based skills for careers across the environmental professions, in particular environmental protection and management.',
    'A graduate is expected to understand contemporary issues in environmental management, the interactions between physical processes and ecosystems, and the legislative and ethical framework in which environmental scientists work.',
  ],
  whyStudy: [
    { icon: 'globe', title: 'A science with real problems', text: 'Pollution, water, waste and climate are daily concerns in the region.' },
    { icon: 'flask', title: 'Laboratory and field skills', text: 'Sample, measure and analyse, in the field and the laboratory.' },
    { icon: 'search', title: 'GIS and data', text: 'Mapping and analysing environmental data.' },
    { icon: 'briefcase', title: 'Growing demand', text: 'Environmental protection and climate work need trained people.' },
  ],
  outcomes: [
    'Understand contemporary issues in environmental management.',
    'Explain the interactions between physical processes and ecosystems.',
    'Sample and analyse water, soil and air and report the results.',
    'Use GIS and statistics for environmental data.',
    'Describe the legislative and ethical framework for environmental work.',
  ],
  years: [
    year(1, ['Introduction to Environmental Sciences', 'General Chemistry', 'General Biology', 'Functional English', 'Islamic Studies'], ['Ecology', 'Earth Science', 'Statistics', 'Expository Writing', 'Pakistan Studies']),
    year(2, ['Environmental Chemistry', 'Environmental Microbiology', 'Meteorology and Climatology', 'Computer Skills', 'Research Methods'], ['Water Resources', 'Soil Science', 'Environmental Pollution', 'Field Course I', 'GIS Fundamentals']),
    year(3, ['Water and Wastewater Treatment', 'Solid Waste Management', 'Environmental Impact Assessment', 'Environmental Law and Policy', 'Toxicology'], ['Climate Change and Adaptation', 'Remote Sensing', 'Environmental Biotechnology', 'Field Course II', 'Scientific Writing']),
    year(4, ['Environmental Economics', 'Elective I', 'Elective II', 'Research Project I'], ['Disaster Risk Reduction', 'Elective III', 'Seminar', 'Research Project II']),
  ],
  tracks: [
    { icon: 'flask', title: 'Pollution and bioremediation', text: 'Detecting contaminants and cleaning them up.' },
    { icon: 'search', title: 'GIS and remote sensing', text: 'Maps and satellite images for planning.' },
    { icon: 'cloud', title: 'Climate and hydrology', text: 'Climate change, floods and glaciers.' },
    { icon: 'shield', title: 'Assessment and management', text: 'Impact assessment, risk and policy.' },
  ],
  skills: [
    { group: 'Laboratory and field', items: ['Water and soil sampling', 'Chemical analysis', 'Microbial testing', 'Field surveys'] },
    { group: 'Analysis', items: ['GIS mapping', 'Remote sensing', 'Statistics'] },
    { group: 'Professional', items: ['Impact assessment', 'Report writing', 'Teamwork', 'Environmental law'] },
  ],
  careers: [
    { icon: 'shield', title: 'Environmental officer', text: 'Environmental protection agencies and industry.' },
    { icon: 'briefcase', title: 'Environmental consultant', text: 'Impact assessments, audits and surveys.' },
    { icon: 'globe', title: 'Climate and disaster-risk work', text: 'Government and non-profit programmes.' },
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Colleges and universities.' },
    { icon: 'flask', title: 'Researcher', text: 'MS, MPhil and PhD, then research posts.' },
  ],
  faq: [
    { q: 'What do I need to apply?', a: 'The department has not published an entry requirement. The merit criteria are announced with each intake on the admissions page.' },
    ...scienceFaq('Environmental Sciences', 4),
  ],
}
