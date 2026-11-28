import { officeBanner, officeHero } from '../../../offices/art'
import type { DepartmentProfile, DisciplineProfile } from '../../types'
import { year } from '../core'

import { pictures, scienceFaq } from './core'

/* Department of Chemistry (the old page also calls it the Institute of Chemical Sciences), laid out like the DCST department page.
   FROM THE UNIVERSITY'S PAGE, read 2026-11-06 (saved copy on the owner's Drive): the description of the subject, the founding date
   (November 2013), the vision and pledge, the programmes (BS and MPhil in Chemistry), the eligibility for both, and eleven named staff with
   titles and qualifications.
   EVERYTHING ELSE (highlights, laboratories, research areas, careers, student life, questions and the study plan) is illustrative text for the
   template that nobody in the department has checked: `status: 'draft'`. Replace it, then set `reviewed`. */

const PAGE = 'https://uswat.edu.pk/department-of-chemistry/'
export const SLUG = 'chemistry'
export const BS = 'bs-chemistry-2'

export const chemistry: DepartmentProfile = {
  slug: SLUG,
  status: 'draft',
  shortName: 'Chemistry',
  tagline: 'The properties, composition and transformation of matter, from the molecule up.',
  intro: 'BS and MPhil study in chemistry, taught since November 2013 by a faculty trained at universities in Pakistan, Germany, South Korea and China.',
  hero: officeHero(SLUG),
  banner: officeBanner(SLUG, 'Department of Chemistry. University of Swat. Matter, molecules and materials.'),
  tile: officeHero(SLUG, 'Illustration for the Department of Chemistry'),
  levelText: 'BS and MPhil',
  programmesLede: 'The department’s page lists the BS in Chemistry and the Master of Philosophy in Chemistry.',
  about: [
    'Chemistry studies the properties, composition and transformation of matter. It adds to our knowledge not only by discovering what already exists but by creating new substances and materials at the molecular level, and it is one of the central sciences that help us understand the origin of life.',
    'The synthesis, discovery and characterisation of molecules and their reactions, in the laboratory, in the environment or within a living organism, have profound effects on society. Chemists look for sustainable solutions for energy production and storage, greener ways to make pharmaceuticals and industrial materials, and better ways to detect and clean up environmental pollutants.',
    'Considering the importance and scope of chemistry, the Institute of Chemical Sciences was established in November 2013 at the University of Swat, with a qualified and dedicated faculty. Students who want an academic or research career in chemistry are welcome.',
  ],
  vision:
    'To advance the chemical sciences by engaging faculty, qualified at well-reputed organisations, who provide quality education, research and service. We will graduate scientists who know chemistry, follow recognised standards of ethical scientific behaviour, and practise chemistry safely and sustainably.',
  mission:
    'The institute pledges to encourage, in the broadest and most liberal manner, the advancement of science and particularly of chemistry in all its branches, including analytical, bio-, inorganic, organic and physical chemistry, through its education, research and service missions.',
  highlights: [
    { icon: 'flask', title: 'Five branches of chemistry', text: 'Analytical, bio-, inorganic, organic and physical chemistry are all taught, so students see the whole subject.' },
    { icon: 'layers', title: 'Laboratory in every year', text: 'Practical courses begin in the first semester, with safety and good practice before any reaction.' },
    { icon: 'search', title: 'Instruments that identify', text: 'Students learn spectroscopy and chromatography to find out what a sample contains.' },
    { icon: 'shield', title: 'Safe and sustainable practice', text: 'Waste handling, risk assessment and greener methods are part of every laboratory course.' },
    { icon: 'rocket', title: 'A final-year research project', text: 'Each student works on a problem with a supervisor and writes it up as a short thesis.' },
    { icon: 'cap', title: 'Paths to further study', text: 'The BS prepares graduates for MPhil and PhD study in chemistry and related fields.' },
  ],
  disciplines: [BS],
  labs: [
    {
      title: 'General and inorganic chemistry laboratory',
      text: 'Titration, qualitative analysis and the preparation of inorganic compounds.',
      art: officeHero(SLUG),
      tools: ['Analytical balances', 'Fume hoods', 'Hot plates and stirrers'],
    },
    {
      title: 'Organic chemistry laboratory',
      text: 'Synthesis, purification and the identification of organic compounds.',
      art: officeHero(BS),
      tools: ['Rotary evaporator', 'Reflux and distillation sets', 'Thin-layer chromatography plates'],
    },
    {
      title: 'Analytical and instrumental laboratory',
      text: 'Spectroscopic and chromatographic analysis of food, water and soil samples.',
      art: officeHero(SLUG),
      tools: ['UV-visible spectrophotometer', 'pH and conductivity meters', 'Chromatography equipment'],
    },
    {
      title: 'Physical chemistry and energy laboratory',
      text: 'Kinetics, electrochemistry and basic experiments on materials for energy storage.',
      art: officeHero(BS),
      tools: ['Potentiostat', 'Constant-temperature baths', 'Calorimeter'],
    },
  ],
  research: [
    { icon: 'flask', title: 'Analytical chemistry', text: 'Methods that measure what is in food, water and medicines.', tags: ['Spectroscopy', 'Chromatography', 'Food and water'] },
    { icon: 'gear', title: 'Organic and medicinal chemistry', text: 'New compounds and the natural products of local plants.', tags: ['Synthesis', 'Natural products', 'Drug discovery'] },
    { icon: 'spark', title: 'Materials and new energy', text: 'Materials for batteries and other energy storage.', tags: ['Electrochemistry', 'Energy storage', 'Nanomaterials'] },
    { icon: 'globe', title: 'Environmental chemistry', text: 'Detecting pollutants and finding ways to clean them up.', tags: ['Pollutants', 'Water quality', 'Sustainability'] },
  ],
  careers: [
    { icon: 'flask', title: 'Laboratory analyst', text: 'Quality control and testing in industry and public laboratories.' },
    { icon: 'gear', title: 'Industrial chemist', text: 'Pharmaceutical, food, textile and materials industries.' },
    { icon: 'shield', title: 'Environmental and safety officer', text: 'Monitoring and reducing chemical risks.' },
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'search', title: 'Researcher', text: 'MPhil and PhD study, then research posts.' },
    { icon: 'briefcase', title: 'Public service', text: 'Competitive examinations and technical posts in the public sector.' },
  ],
  studentLife: [
    { icon: 'users', title: 'Chemistry society', text: 'Student-run demonstrations, quiz nights and lab-safety days.' },
    { icon: 'book', title: 'Study groups', text: 'Peer groups for organic mechanisms and physical chemistry problems.' },
    { icon: 'spark', title: 'Seminars and guest talks', text: 'Visiting chemists and industry staff talk about their work.' },
    { icon: 'trophy', title: 'Science day', text: 'Students show reactions and models to schools in the district.' },
  ],
  faq: [
    { q: 'Which programmes does the department offer?', a: 'The department’s page lists the BS in Chemistry and the Master of Philosophy (MPhil) in Chemistry, with a PhD page linked.' },
    { q: 'What do I need to apply for the BS?', a: 'HSSC or equivalent with Chemistry, with at least 45% overall marks and at least 45% in the subject of Chemistry.' },
    { q: 'What do I need for the MS or MPhil?', a: 'An M.Sc. or BS in Chemistry with at least 45% marks and a CGPA of 2.5 out of 4.0. Other requirements, including the GRE test if any, are announced in the admission advertisement.' },
    { q: 'Who leads the department?', a: 'The department’s page names Dr. Muhammad Omer, Associate Professor and Chairman.' },
    { q: 'Where can I find the latest notices?', a: 'Merit lists, timetables and announcements are published on the university notices page.' },
  ],
  peopleTitle: 'Chairman and faculty',
  peopleLede: 'The eleven staff named on the department’s page, with the titles and qualifications it gives.',
  alumni: ['water-hardness-survey-swat-springs', 'green-synthesis-silver-nanoparticles', 'vitamin-c-content-local-fruits'],
  team: [
    {
      id: 'muhammad-omer',
      name: 'Dr. Muhammad Omer',
      title: 'Associate Professor and Chairman',
      role: 'head',
      roleLabel: 'Chairman',
      qualifications: ['PhD in Chemistry, Kyungpook National University (KNU), Daegu, South Korea'],
    },
    { id: 'najeeb-ur-rehman', name: 'Dr. Najeeb Ur Rehman', title: 'Professor', role: 'member' },
    { id: 'fazal-mabood', name: 'Dr. Fazal Mabood', title: 'Professor', role: 'member' },
    { id: 'ihsan-ullah', name: 'Dr. Ihsan Ullah', title: 'Associate Professor', role: 'member', qualifications: ['PhD in Chemistry, University of Rostock, Germany'] },
    { id: 'adnan', name: 'Dr. Adnan', title: 'Associate Professor', role: 'member', qualifications: ['PhD in Analytical Chemistry, University of Peshawar'] },
    { id: 'adnan-shahzad', name: 'Dr. Adnan Shahzad', title: 'Assistant Professor', role: 'member', qualifications: ['PhD in Inorganic Chemistry, University of Malakand'] },
    { id: 'main-gul-sayed', name: 'Dr. Main Gul Sayed', title: 'Assistant Professor', role: 'member', qualifications: ['PhD in Organic Chemistry, University of Malakand'] },
    { id: 'mohammad-sohail', name: 'Dr. Mohammad Sohail', title: 'Assistant Professor', role: 'member', qualifications: ['PhD in Physical Chemistry, University of Peshawar'] },
    { id: 'imad-ud-din', name: 'Dr. Imad Ud Din', title: 'Assistant Professor', role: 'member', qualifications: ['PhD in Physical Chemistry'] },
    { id: 'aziz-ahmad', name: 'Dr. Aziz Ahmad', title: 'Assistant Professor', role: 'member', qualifications: ['PhD in Physical Chemistry'] },
    { id: 'rahim-shah', name: 'Dr. Rahim Shah', title: 'Assistant Professor', role: 'member', qualifications: ['PhD in New Energy Science and Engineering'] },
  ],
  reference: {
    sources: [{ label: 'Department of Chemistry page, University of Swat', url: PAGE }],
    verifiedAt: '2026-11-06',
    openPoints: [
      'The page calls the unit both the Department of Chemistry and the Institute of Chemical Sciences. The Main Campus page lists the Department of Chemistry in Academic Block A; the university will confirm which name is current.',
      'The page gives no telephone number or department e-mail; staff e-mail addresses on the page are not shown here. It gives no seat numbers, fees or intake dates.',
      'One staff entry reads “Dr. Main Gul Sayed” while the address printed with it begins “mian”; one reads only “Dr. Adnan”; the university of one PhD is given only as “University, China”. They are shown as the page gives them or left out.',
      'The BS Chemistry programme page on the old site holds only four document links, so its study plan, outcomes and careers are illustrative.',
      'Highlights, laboratories, research areas, careers and student life on this page are illustrative text for the template, not statements by the department.',
    ],
  },
}

export const bsChemistry: DisciplineProfile = {
  slug: BS,
  department: SLUG,
  status: 'draft',
  name: 'BS Chemistry',
  shortName: 'Chemistry',
  eligibility: 'HSSC or equivalent with Chemistry, with at least 45% overall marks and at least 45% in the subject of Chemistry.',
  curriculumLede:
    'This study plan is illustrative until the department confirms its approved scheme of studies. Elective courses are chosen from the tracks below.',
  tagline: 'Learn how matter behaves, and how to change it safely.',
  summary: 'Analytical, inorganic, organic and physical chemistry, with laboratory work in every semester.',
  ...pictures(BS, SLUG, 'BS Chemistry. Department of Chemistry, University of Swat.', 'Illustration for BS Chemistry'),
  about: [
    'BS Chemistry covers the main branches of the subject: analytical, inorganic, organic and physical chemistry, with biochemistry and environmental chemistry as options. Each branch pairs lectures with practical work.',
    'Students learn to plan and carry out experiments, use modern instruments and write up results. In the last year they choose electives and work on a research project with a supervisor.',
  ],
  whyStudy: [
    { icon: 'flask', title: 'Hands-on from the first semester', text: 'Laboratory courses start in year one, beginning with safety and basic technique.' },
    { icon: 'search', title: 'Instruments that identify', text: 'Students use spectroscopy and chromatography to analyse real samples.' },
    { icon: 'shield', title: 'Safety and sustainability', text: 'Risk assessment and greener methods are part of each practical course.' },
    { icon: 'cap', title: 'A route to MPhil and PhD', text: 'The degree prepares graduates for postgraduate study in chemistry.' },
  ],
  outcomes: [
    'Explain the principles of analytical, inorganic, organic and physical chemistry.',
    'Carry out laboratory work safely and record it accurately.',
    'Use instruments such as spectrophotometers and chromatographs to identify and measure substances.',
    'Analyse data, estimate error and report results in clear scientific writing.',
    'Apply chemical knowledge to problems in industry, health and the environment.',
  ],
  years: [
    year(1, ['General Chemistry I', 'Calculus I', 'Chemistry Laboratory I', 'Functional English', 'Islamic Studies'], ['General Chemistry II', 'Physics for Chemists', 'Chemistry Laboratory II', 'Expository Writing', 'Pakistan Studies']),
    year(2, ['Inorganic Chemistry I', 'Organic Chemistry I', 'Physical Chemistry I', 'Analytical Chemistry I', 'Computer Skills'], ['Inorganic Chemistry II', 'Organic Chemistry II', 'Physical Chemistry II', 'Analytical Chemistry II', 'Statistics for Scientists']),
    year(3, ['Spectroscopy', 'Organic Reaction Mechanisms', 'Coordination Chemistry', 'Electrochemistry', 'Chemistry Laboratory III'], ['Chromatography and Separation', 'Biochemistry', 'Industrial Chemistry', 'Environmental Chemistry', 'Research Methods']),
    year(4, ['Elective I', 'Elective II', 'Chemistry Laboratory IV', 'Research Project I'], ['Elective III', 'Chemical Safety and Waste Management', 'Seminar', 'Research Project II']),
  ],
  tracks: [
    { icon: 'search', title: 'Analytical chemistry', text: 'Identifying and measuring what is in a sample.' },
    { icon: 'flask', title: 'Organic and medicinal chemistry', text: 'Making and purifying compounds, including natural products.' },
    { icon: 'spark', title: 'Physical chemistry and energy', text: 'Kinetics, thermodynamics and electrochemistry for energy storage.' },
    { icon: 'globe', title: 'Environmental chemistry', text: 'Pollutants in water, soil and air, and how to remove them.' },
  ],
  skills: [
    { group: 'Laboratory', items: ['Titration', 'Synthesis and purification', 'Spectroscopy', 'Chromatography'] },
    { group: 'Analysis', items: ['Data analysis', 'Error estimation', 'Statistics'] },
    { group: 'Professional', items: ['Laboratory safety', 'Report writing', 'Teamwork', 'Ethics'] },
  ],
  careers: [
    { icon: 'flask', title: 'Laboratory analyst', text: 'Testing and quality control in industry and public laboratories.' },
    { icon: 'gear', title: 'Industrial chemist', text: 'Pharmaceutical, food and materials industries.' },
    { icon: 'shield', title: 'Environmental and safety officer', text: 'Monitoring chemical risks.' },
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'search', title: 'Researcher', text: 'MPhil and PhD study, then research posts.' },
  ],
  faq: [
    { q: 'What do I need to apply?', a: 'HSSC or equivalent with Chemistry, with at least 45% overall marks and at least 45% in the subject of Chemistry.' },
    ...scienceFaq('Chemistry', 4),
  ],
}
