import type { Faq, Year } from '../types'

export const sem = (name: string, courses: string[]) => ({ name, courses })
export const year = (n: number, a: string[], b: string[]): Year => ({
  year: n,
  semesters: [sem(`Semester ${2 * n - 1}`, a), sem(`Semester ${2 * n}`, b)],
})

/** The first year is common to the five DCST programmes. */
export const firstYear = year(
  1,
  [
    'Programming Fundamentals',
    'Introduction to Information and Communication Technologies',
    'Calculus and Analytical Geometry',
    'Functional English',
    'Islamic Studies',
  ],
  [
    'Object-Oriented Programming',
    'Discrete Structures',
    'Linear Algebra',
    'Expository Writing',
    'Pakistan Studies',
  ],
)

/** Questions that are the same for every DCST discipline. */
export const commonFaq = (shortName: string): Faq[] => [
  {
    q: 'How long is the programme?',
    a: `The BS ${shortName} programme takes four years, in eight semesters. The first year is common to all DCST programmes.`,
  },
  {
    q: 'Is there a final-year project?',
    a: 'Yes. In the seventh and eighth semesters each student, or a small group, builds a project with a supervisor and presents it to the department.',
  },
  {
    q: 'Where can I read the admission rules?',
    a: 'The eligibility is on this page. The admissions portal opens when an intake is announced, and merit lists are published on the university notices page.',
  },
]
