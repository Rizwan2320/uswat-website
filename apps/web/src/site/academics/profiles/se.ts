import type { DisciplineProfile } from '../types'

import { art, banner } from './art'
import { commonFaq, firstYear, year } from './core'

export const se: DisciplineProfile = {
  slug: 'bs-software-engineering',
  department: 'dcst',
  status: 'draft',
  shortName: 'SE',
  tagline: 'How teams plan, build, test and maintain software that people depend on.',
  summary:
    'Requirements, design, testing and project management: the craft of building large software in teams.',
  hero: art('se', 'hero'),
  banner: banner('se', 'Department of Software Engineering. Design, Develop, Innovate.'),
  tile: art(
    'se',
    'tile',
    'Illustration of stacked software layers beside a version-control history',
  ),
  figure: art(
    'se',
    'lab',
    'Illustration of stacked software layers beside a version-control history',
  ),
  about: [
    'BS Software Engineering treats software as something built by a team over years, not by one person in a weekend. It covers how to find out what users need, how to design a system that can change, and how to test and release it with confidence.',
    'Most courses include a team project. Students use version control, code review and automated tests from the second year, and finish with a final-year project run like a small company.',
  ],
  whyStudy: [
    {
      icon: 'layers',
      title: 'Design for change',
      text: 'Architecture, patterns and quality: building software that is still easy to change in five years.',
    },
    {
      icon: 'users',
      title: 'Learning in teams',
      text: 'Team projects in most semesters, with roles, reviews and retrospectives.',
    },
    {
      icon: 'rocket',
      title: 'Modern practice',
      text: 'Version control, continuous integration, containers and cloud deployment.',
    },
    {
      icon: 'briefcase',
      title: 'In demand',
      text: 'Software companies and freelance clients look for people who can deliver working systems.',
    },
  ],
  outcomes: [
    'Elicit, analyse and write software requirements with users.',
    'Design systems with sound architecture and appropriate design patterns.',
    'Plan and track a software project, estimating effort and managing risk.',
    'Test software at several levels and measure its quality.',
    'Build, release and maintain a system using modern tools and a team workflow.',
  ],
  years: [
    firstYear,
    year(
      2,
      [
        'Data Structures and Algorithms',
        'Software Requirements Engineering',
        'Digital Logic Design',
        'Probability and Statistics',
        'Communication and Presentation Skills',
      ],
      [
        'Database Systems',
        'Software Design and Architecture',
        'Operating Systems',
        'Human-Computer Interaction',
        'Design and Analysis of Algorithms',
      ],
    ),
    year(
      3,
      [
        'Software Construction and Development',
        'Software Quality Engineering',
        'Computer Networks',
        'Web Engineering',
        'Elective I',
      ],
      [
        'Software Project Management',
        'Mobile Application Development',
        'Software Testing',
        'DevOps and Cloud Engineering',
        'Elective II',
      ],
    ),
    year(
      4,
      [
        'Final Year Project I',
        'Software Maintenance and Evolution',
        'Information Security',
        'Professional Practices',
        'Elective III',
      ],
      ['Final Year Project II', 'Entrepreneurship', 'Elective IV', 'Elective V'],
    ),
  ],
  tracks: [
    {
      icon: 'phone',
      title: 'Mobile and web',
      text: 'Front-end and back-end engineering for web and mobile products.',
    },
    {
      icon: 'cloud',
      title: 'Cloud and DevOps',
      text: 'Containers, pipelines and reliable deployment.',
    },
    {
      icon: 'search',
      title: 'Quality and testing',
      text: 'Test automation, performance testing and quality metrics.',
    },
    {
      icon: 'briefcase',
      title: 'Product and management',
      text: 'Requirements, estimation and leading a software team.',
    },
  ],
  skills: [
    { group: 'Languages', items: ['Java', 'Python', 'JavaScript', 'TypeScript', 'SQL'] },
    {
      group: 'Tools',
      items: ['Git', 'Docker', 'Jira-style boards', 'JUnit and pytest', 'CI pipelines'],
    },
    {
      group: 'Concepts',
      items: ['UML', 'Design patterns', 'Agile and Scrum', 'Testing', 'Code review'],
    },
  ],
  careers: [
    { icon: 'code', title: 'Software engineer', text: 'Develop and maintain products in a team.' },
    {
      icon: 'search',
      title: 'Quality assurance engineer',
      text: 'Design tests and automate them.',
    },
    {
      icon: 'cloud',
      title: 'DevOps engineer',
      text: 'Build the pipelines that ship software safely.',
    },
    {
      icon: 'briefcase',
      title: 'Business or systems analyst',
      text: 'Turn what users need into clear requirements.',
    },
  ],
  faq: [
    {
      q: 'Do I need to know programming before I join?',
      a: 'No. The first year starts from the basics and is shared with the other DCST programmes.',
    },
    ...commonFaq('Software Engineering'),
  ],
}
