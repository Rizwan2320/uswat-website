import type { DisciplineProfile } from '../types'

import { art } from './art'
import { commonFaq, firstYear, year } from './core'

export const cs: DisciplineProfile = {
  slug: 'bs-computer-science',
  department: 'dcst',
  status: 'draft',
  shortName: 'CS',
  tagline:
    'The theory and practice of computing: algorithms, systems and the mathematics behind them.',
  summary:
    'The broadest of the five: algorithms, operating systems, databases, networks and the theory that holds them together.',
  hero: art('cs', 'hero'),
  tile: art('cs', 'tile', 'Illustration of a binary tree beside a window of program code'),
  figure: art('cs', 'lab', 'Illustration of a binary tree beside a window of program code'),
  about: [
    'BS Computer Science is the foundation degree of the department. It teaches how computers work from logic gates up to operating systems, how to design efficient algorithms and data structures, and how to reason about whether a program is correct.',
    'Students write a great deal of code, in several languages, and learn the mathematics that explains why it works. Electives in the last two years let them lean towards systems, security, graphics or intelligent systems.',
  ],
  whyStudy: [
    {
      icon: 'code',
      title: 'Strong programming base',
      text: 'Four semesters of programming, data structures and algorithms before any specialisation.',
    },
    {
      icon: 'gear',
      title: 'How systems really work',
      text: 'Computer organisation, operating systems, compilers and networks, taught with laboratory work.',
    },
    {
      icon: 'cap',
      title: 'Ready for graduate study',
      text: 'The mathematics and theory courses prepare students for MS and PhD programmes.',
    },
    {
      icon: 'briefcase',
      title: 'Flexible careers',
      text: 'The widest choice of roles of the five programmes, from development to research.',
    },
  ],
  outcomes: [
    'Design and implement programs in several languages, using appropriate data structures and algorithms.',
    'Explain how an operating system, a compiler and a network stack work, and reason about their performance.',
    'Model data and write queries for relational databases.',
    'Apply discrete mathematics, probability and logic to analyse problems and prove properties of programs.',
    'Work in a team to plan, build, test and present a substantial software project.',
  ],
  years: [
    firstYear,
    year(
      2,
      [
        'Data Structures and Algorithms',
        'Digital Logic Design',
        'Probability and Statistics',
        'Computer Organisation and Assembly Language',
        'Communication and Presentation Skills',
      ],
      [
        'Database Systems',
        'Operating Systems',
        'Design and Analysis of Algorithms',
        'Theory of Automata',
        'Software Engineering',
      ],
    ),
    year(
      3,
      [
        'Computer Networks',
        'Artificial Intelligence',
        'Compiler Construction',
        'Numerical Computing',
        'Elective I',
      ],
      [
        'Information Security',
        'Parallel and Distributed Computing',
        'Web Technologies',
        'Computer Graphics',
        'Elective II',
      ],
    ),
    year(
      4,
      ['Final Year Project I', 'Professional Practices', 'Elective III', 'Elective IV'],
      ['Final Year Project II', 'Entrepreneurship', 'Elective V', 'Elective VI'],
    ),
  ],
  tracks: [
    {
      icon: 'gear',
      title: 'Systems and architecture',
      text: 'Operating systems, embedded systems and high-performance computing.',
    },
    {
      icon: 'shield',
      title: 'Security',
      text: 'Cryptography, secure programming and digital forensics.',
    },
    {
      icon: 'brain',
      title: 'Intelligent systems',
      text: 'Machine learning, natural language processing and computer vision.',
    },
    {
      icon: 'code',
      title: 'Theory and algorithms',
      text: 'Advanced algorithms, complexity and formal methods.',
    },
  ],
  skills: [
    { group: 'Languages', items: ['C++', 'Python', 'Java', 'SQL', 'Assembly'] },
    { group: 'Tools', items: ['Git', 'Linux', 'Visual Studio Code', 'GDB', 'LaTeX'] },
    {
      group: 'Concepts',
      items: ['Algorithms', 'Data structures', 'Operating systems', 'Compilers', 'Networks'],
    },
  ],
  careers: [
    {
      icon: 'code',
      title: 'Software developer',
      text: 'Build applications and services for companies and start-ups.',
    },
    {
      icon: 'gear',
      title: 'Systems programmer',
      text: 'Work close to the machine: operating systems, drivers and embedded software.',
    },
    {
      icon: 'shield',
      title: 'Security engineer',
      text: 'Find and fix weaknesses before attackers do.',
    },
    {
      icon: 'cap',
      title: 'Researcher or lecturer',
      text: 'MS and PhD study, then research or teaching.',
    },
  ],
  faq: [
    {
      q: 'How is Computer Science different from Software Engineering?',
      a: 'Computer Science puts more weight on theory, algorithms and systems. Software Engineering puts more weight on how teams plan, build, test and maintain large programs.',
    },
    ...commonFaq('Computer Science'),
  ],
}
