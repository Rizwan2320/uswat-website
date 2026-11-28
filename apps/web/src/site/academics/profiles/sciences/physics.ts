import { officeBanner, officeHero } from '../../../offices/art'
import type { DepartmentProfile, DisciplineProfile } from '../../types'
import { year } from '../core'

import { pictures, scienceFaq } from './core'

/* Department of Physics, laid out like the DCST department page (the owner's blueprint, 2026-11-24).
   FROM THE UNIVERSITY'S PAGE, read 2026-11-06 (saved copy on the owner's Drive): the introduction, the vision and mission text, the programmes
   offered (BS Physics offered; MS/MPhil Physics intended), the eligibility for both, and five named staff with titles and qualifications.
   EVERYTHING ELSE (highlights, laboratories, research areas, careers, student life, questions and the study plan) is illustrative text for the
   template that nobody in the department has checked: `status: 'draft'`. Replace it, then set `reviewed`. */

const PAGE = 'https://uswat.edu.pk/department-of-physics/'
export const SLUG = 'physics'
export const BS = 'bs-physics-2'

export const physics: DepartmentProfile = {
  slug: SLUG,
  status: 'draft',
  shortName: 'Physics',
  tagline: 'The laws of nature, tested in the laboratory and written in mathematics.',
  intro: 'A BS in Physics for students who want a firm foundation in the principles of physics and their uses, with MS and MPhil study planned.',
  hero: officeHero(SLUG),
  banner: officeBanner(SLUG, 'Department of Physics. University of Swat. Physics for a changing world.'),
  tile: officeHero(SLUG, 'Illustration for the Department of Physics'),
  levelText: 'BS',
  programmesLede: 'The department offers the BS in Physics; the MS and MPhil are listed on its page as intended.',
  about: [
    'The Department of Physics provides the best possible education in the subject so that students can use the knowledge of physics in practical life, to the benefit of society.',
    'The aim of the programme is to produce broad-based graduates able to face the challenges of the modern world. It gives students a firm foundation in the principles of physics and their applications.',
    'Graduates can apply physics in their professional growth and go on to higher education in specialised fields of physics.',
  ],
  vision:
    'We envision our Institute to play a leading role in teaching and research, and expect our graduates to serve the nation and humanity.',
  mission:
    'To give students a conceptual understanding of the fundamental principles of physics and natural laws, and of the mathematics that describes physical phenomena. To build the critical skills needed to analyse and solve problems from their surroundings, and a deep appreciation of the need to use natural resources and the environment wisely. To produce well-trained graduates and researchers who can meet future challenges at regional and international levels, and to build a research culture with well-equipped laboratories and strong national and international collaborations.',
  highlights: [
    { icon: 'layers', title: 'Principles first', text: 'Mechanics, waves, electricity and modern physics are taught from first principles, with the mathematics worked out in class.' },
    { icon: 'flask', title: 'Laboratory every semester', text: 'Each semester pairs lectures with measurement practice, error analysis and a written report.' },
    { icon: 'chart', title: 'Mathematics as a tool', text: 'Calculus and differential equations are used on physical problems, not taught apart from them.' },
    { icon: 'gear', title: 'Electronics and instruments', text: 'Students build and test circuits and learn how measuring instruments work and fail.' },
    { icon: 'rocket', title: 'A final-year research project', text: 'Each student works on a small experiment or calculation with a supervisor and presents the result.' },
    { icon: 'cap', title: 'Paths to further study', text: 'The BS prepares graduates for MS and MPhil study, in Pakistan or abroad.' },
  ],
  disciplines: [BS],
  labs: [
    {
      title: 'General physics laboratory',
      text: 'Mechanics, heat, optics and electricity experiments for the first two years, with weekly reports.',
      art: officeHero(SLUG),
      tools: ['Optical benches', 'Vernier calipers and micrometers', 'Digital multimeters'],
    },
    {
      title: 'Electronics and instrumentation laboratory',
      text: 'Circuit building, sensors and data capture, from diodes to simple microcontroller projects.',
      art: officeHero(BS),
      tools: ['Oscilloscopes', 'Function generators', 'Breadboards and microcontroller kits'],
    },
    {
      title: 'Modern physics and materials laboratory',
      text: 'Spectra, the photoelectric effect and basic measurements on thin films and nanomaterials.',
      art: officeHero(SLUG),
      tools: ['Spectrometer', 'Photoelectric apparatus', 'Hall-effect set-up'],
    },
    {
      title: 'Computational physics workstation room',
      text: 'Simulation and data analysis for problems that are too long to do by hand.',
      art: officeHero(BS),
      tools: ['Python and numerical libraries', 'Plotting tools', 'Shared workstations'],
    },
  ],
  research: [
    { icon: 'flask', title: 'Nanomaterials and graphene', text: 'Carbon-based materials and their electrical and optical behaviour.', tags: ['Graphene', 'Nanomaterials', 'Thin films'] },
    { icon: 'spark', title: 'Quantum physics', text: 'Quantum systems and their description, from theory to simple models.', tags: ['Quantum mechanics', 'Optics', 'Theory'] },
    { icon: 'gear', title: 'Condensed matter and devices', text: 'How the structure of a solid shapes the way a device behaves.', tags: ['Semiconductors', 'Electronics', 'Sensors'] },
    { icon: 'globe', title: 'Energy and environment', text: 'Measuring sunlight, heat and radiation for local energy use.', tags: ['Solar energy', 'Radiation', 'Environment'] },
  ],
  careers: [
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'flask', title: 'Researcher', text: 'MS, MPhil and PhD study, then research posts.' },
    { icon: 'gear', title: 'Instrumentation or electronics technologist', text: 'Industry and test laboratories.' },
    { icon: 'chart', title: 'Data analyst', text: 'Roles that use modelling and measurement.' },
    { icon: 'shield', title: 'Radiation and safety officer', text: 'Hospitals and industry that handle radiation.' },
    { icon: 'briefcase', title: 'Public service', text: 'Competitive examinations and technical posts in the public sector.' },
  ],
  studentLife: [
    { icon: 'users', title: 'Physics society', text: 'Student-run talks, quiz nights and demonstrations for first-year students.' },
    { icon: 'book', title: 'Problem-solving circles', text: 'Peer groups that work through problem sets together before each test.' },
    { icon: 'spark', title: 'Guest lectures', text: 'Visiting physicists talk about current research and careers.' },
    { icon: 'trophy', title: 'Science day', text: 'Students show experiments and models to schools in the district.' },
  ],
  faq: [
    { q: 'Which programmes does the department offer?', a: 'The BS in Physics is offered. The MS and MPhil in Physics are listed on the department’s page as intended.' },
    { q: 'What do I need to apply for the BS?', a: 'F.Sc. or equivalent with at least 45% in the subject of Physics.' },
    { q: 'What do I need for the MS or MPhil?', a: 'An M.Sc. or BS in Physics with at least 45% marks and a CGPA of 2.5 out of 4.0, and an NTS or departmental subject test as per university rules.' },
    { q: 'Who leads the department?', a: 'The department’s page names Dr. Kefayat Ullah, Associate Professor and Chairman.' },
    { q: 'Where can I find the latest notices?', a: 'Merit lists, timetables and announcements are published on the university notices page.' },
  ],
  peopleTitle: 'Chairman and faculty',
  peopleLede: 'The five staff named on the department’s page, with the titles and qualifications it gives.',
  alumni: ['thin-film-conductivity-measurement', 'low-cost-solar-radiation-logger', 'pendulum-motion-simulation'],
  team: [
    {
      id: 'kefayat-ullah',
      name: 'Dr. Kefayat Ullah',
      title: 'Associate Professor and Chairman',
      role: 'head',
      roleLabel: 'Chairman',
      qualifications: ['PhD in Graphene Based Nanomaterials, Department of Advanced Materials Science and Engineering, Hanseo University, South Korea'],
    },
    { id: 'amin-ur-rashid', name: 'Dr. Amin Ur Rashid', title: 'Associate Professor', role: 'member', qualifications: ['PhD in Physics'] },
    { id: 'fazli-hadi', name: 'Dr. Fazli Hadi', title: 'Associate Professor', role: 'member', qualifications: ['PhD in Physics, University of Peshawar'] },
    { id: 'salah-uddin', name: 'Dr. Salah Uddin', title: 'Assistant Professor', role: 'member', qualifications: ['PhD in Physics, City University of Hong Kong'] },
    {
      id: 'rafi-ud-din',
      name: 'Dr. Rafi ud Din',
      title: 'Assistant Professor',
      role: 'member',
      qualifications: ['PhD in Physics (Quantum), Huazhong University of Science and Technology'],
    },
  ],
  reference: {
    sources: [{ label: 'Department of Physics page, University of Swat', url: PAGE }],
    verifiedAt: '2026-11-06',
    openPoints: [
      'The page says the BS in Physics is offered and the MS/MPhil is intended; it names the BS scheme “Fall 2021 onwards” and links an MPhil and PhD page. It gives no seat numbers, fees or intake dates.',
      'The page lists the department as part of the Main Campus at Charbagh. It gives no telephone number or department e-mail; staff e-mail addresses on the page are not shown here.',
      'The BS Physics programme page on the old site is empty, so the programme page’s study plan, outcomes and careers are illustrative.',
      'Highlights, laboratories, research areas, careers and student life on this page are illustrative text for the template, not statements by the department.',
    ],
  },
}

export const bsPhysics: DisciplineProfile = {
  slug: BS,
  department: SLUG,
  status: 'draft',
  name: 'BS Physics',
  shortName: 'Physics',
  eligibility: 'F.Sc. or equivalent with at least 45% in the subject of Physics.',
  curriculumLede:
    'This study plan is illustrative until the department confirms its approved scheme of studies. Elective courses are chosen from the tracks below.',
  tagline: 'Understand how the physical world works, and measure it.',
  summary: 'Mechanics, electricity, waves, quantum and modern physics, with laboratory work in every semester.',
  ...pictures(BS, SLUG, 'BS Physics. Department of Physics, University of Swat.', 'Illustration for BS Physics'),
  about: [
    'BS Physics gives students a firm foundation in the principles of physics and their applications: classical mechanics, electricity and magnetism, waves and optics, thermal physics, quantum mechanics and the physics of solids.',
    'Mathematics is taught alongside, and every semester includes laboratory practice. In the last year students choose electives and carry out a research project with a supervisor.',
  ],
  whyStudy: [
    { icon: 'layers', title: 'A solid base', text: 'The core courses are the ones every later physics course depends on.' },
    { icon: 'flask', title: 'Measurement skills', text: 'Laboratory work teaches how to measure, estimate error and report honestly.' },
    { icon: 'chart', title: 'Problem solving', text: 'Students learn to turn a physical problem into mathematics and back.' },
    { icon: 'cap', title: 'Ready for MS and MPhil', text: 'The degree prepares graduates for postgraduate study in physics.' },
  ],
  outcomes: [
    'Explain and apply the principles of mechanics, electromagnetism, thermodynamics, optics and quantum physics.',
    'Use calculus, linear algebra and differential equations to model physical situations.',
    'Plan an experiment, take measurements, estimate uncertainty and report the result.',
    'Use computers to simulate and analyse physical systems.',
    'Communicate physical ideas clearly in writing and in a short talk.',
  ],
  years: [
    year(1, ['Mechanics', 'Calculus I', 'General Physics Laboratory I', 'Functional English', 'Islamic Studies'], ['Electricity and Magnetism', 'Calculus II', 'General Physics Laboratory II', 'Expository Writing', 'Pakistan Studies']),
    year(2, ['Waves and Oscillations', 'Differential Equations', 'Thermal Physics', 'Basic Electronics', 'Computer Skills'], ['Optics', 'Mathematical Methods of Physics I', 'Modern Physics', 'Electronics Laboratory', 'Statistics for Scientists']),
    year(3, ['Quantum Mechanics I', 'Classical Mechanics', 'Electromagnetic Theory I', 'Solid State Physics I', 'Computational Physics'], ['Quantum Mechanics II', 'Statistical Mechanics', 'Electromagnetic Theory II', 'Nuclear Physics', 'Research Methods']),
    year(4, ['Atomic and Molecular Physics', 'Elective I', 'Elective II', 'Research Project I'], ['Solid State Physics II', 'Elective III', 'Seminar', 'Research Project II']),
  ],
  tracks: [
    { icon: 'spark', title: 'Quantum and theoretical physics', text: 'Quantum mechanics, field ideas and the mathematics behind them.' },
    { icon: 'gear', title: 'Electronics and instrumentation', text: 'Circuits, sensors and the instruments used in measurement.' },
    { icon: 'flask', title: 'Materials and solid state', text: 'How the structure of a solid decides its electrical and optical behaviour.' },
    { icon: 'globe', title: 'Energy and environment', text: 'Solar radiation, heat transfer and measuring the environment.' },
  ],
  skills: [
    { group: 'Laboratory', items: ['Precision measurement', 'Error analysis', 'Circuit building', 'Spectroscopy'] },
    { group: 'Analysis', items: ['Mathematical modelling', 'Python for data', 'Numerical methods'] },
    { group: 'Professional', items: ['Scientific writing', 'Presenting', 'Teamwork', 'Laboratory safety'] },
  ],
  careers: [
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'flask', title: 'Researcher', text: 'MS, MPhil and PhD, then research posts.' },
    { icon: 'gear', title: 'Instrumentation technologist', text: 'Industry, hospitals and test laboratories.' },
    { icon: 'chart', title: 'Data analyst', text: 'Roles that use modelling and measurement.' },
    { icon: 'shield', title: 'Radiation safety officer', text: 'Organisations that handle radiation.' },
  ],
  faq: [
    { q: 'What do I need to apply?', a: 'F.Sc. or equivalent with at least 45% in the subject of Physics.' },
    ...scienceFaq('Physics', 4),
  ],
}
