/* "Our alumni": work by graduates that the department wants to show (theses, final-year projects, papers).
   Every entry below is made-up sample data: the people, their work and the summaries are not real. The "Sample" tag on the band says so.
   To show a real alumnus: replace the entry, put the portrait (JPG, about 4:5) at `public/images/alumni/<slug>.jpg` and set `photo`,
   and set `workUrl` to the public address of the work (repository, thesis or paper) when there is one. Until `photo` is set, initials show.
   Moving this list into the CMS is described in docs/briefs/alumni-work-cms-handoff.md. */

export type AlumniKind = 'Thesis' | 'Final-year project' | 'Research paper'

export type AlumniWork = {
  /** Address part of /academics/alumni-work/<slug>. */
  slug: string
  name: string
  /** Year the alumnus graduated. */
  classOf: number
  /** Programme slug, for example `bs-computer-science`. */
  programme: string
  kind: AlumniKind
  /** The headline on the card: what the work is, in one line. */
  headline: string
  /** Two or three sentences on the work page. */
  summary: string
  tags: string[]
  /** Portrait path under /images/alumni. Omit until a real photograph is supplied. */
  photo?: string
  /** Public address of the full work. Omit when there is none; the work page then shows the summary only. */
  workUrl?: string
}

export const ALUMNI_PATH = '/academics/alumni-work'
export const alumniHref = (slug: string) => `${ALUMNI_PATH}/${slug}`

export const ALUMNI_WORKS: AlumniWork[] = [
  /* Computer Science */
  {
    slug: 'graph-routing-for-valley-transport',
    name: 'Ayesha Rehman',
    classOf: 2024,
    programme: 'bs-computer-science',
    kind: 'Thesis',
    headline: 'Finding the quickest bus route through a valley with a graph algorithm',
    summary:
      'The thesis models the roads of a hill district as a weighted graph and compares three shortest-path methods on travel time. It shows that a small change to the weights for steep and unpaved sections gives routes riders judge to be more realistic.',
    tags: ['Algorithms', 'Graph theory', 'Transport'],
  },
  {
    slug: 'pashto-spelling-checker',
    name: 'Imran Khattak',
    classOf: 2023,
    programme: 'bs-computer-science',
    kind: 'Research paper',
    headline: 'A spelling checker for Pashto text built from a word list and edit distance',
    summary:
      'The paper builds a word list from public Pashto text and suggests corrections for misspelt words using edit distance. It reports how many of the correct words appear among the first three suggestions on a hand-checked test set.',
    tags: ['Natural language processing', 'Pashto', 'Text'],
  },
  {
    slug: 'compiler-for-a-teaching-language',
    name: 'Zainab Bibi',
    classOf: 2025,
    programme: 'bs-computer-science',
    kind: 'Final-year project',
    headline: 'A small compiler that teaches first-year students how programs are translated',
    summary:
      'The project is a compiler for a very small language that shows each stage (tokens, syntax tree, machine code) on screen. First-year students can step through a program and see what every stage produces.',
    tags: ['Compilers', 'Teaching', 'Programming languages'],
  },
  /* Software Engineering */
  {
    slug: 'clinic-queue-and-records-app',
    name: 'Hamza Yousafzai',
    classOf: 2024,
    programme: 'bs-software-engineering',
    kind: 'Final-year project',
    headline: 'A queue and patient-record app for a small rural clinic that works without internet',
    summary:
      'The team built an app that keeps the clinic queue and visit notes on the device and syncs when a connection returns. The report covers requirements gathering with clinic staff, testing in the field and what changed after the first week of use.',
    tags: ['Mobile apps', 'Offline first', 'Health'],
  },
  {
    slug: 'automated-testing-for-student-portals',
    name: 'Mahnoor Shah',
    classOf: 2023,
    programme: 'bs-software-engineering',
    kind: 'Thesis',
    headline: 'Cutting regression testing time for a university portal with automated test selection',
    summary:
      'The thesis runs only the tests that touch the files changed in a commit, instead of the whole suite. On the portal studied, the test run became shorter while the same defects were still caught.',
    tags: ['Testing', 'Software quality', 'Automation'],
  },
  {
    slug: 'requirements-tool-for-small-teams',
    name: 'Bilal Afridi',
    classOf: 2025,
    programme: 'bs-software-engineering',
    kind: 'Final-year project',
    headline: 'A light requirements tool that links each feature request to its tests and tasks',
    summary:
      'The project gives small teams one place to write a requirement, see the tasks built for it and see which tests prove it works. A user study with two class project teams compared it with a shared spreadsheet.',
    tags: ['Requirements', 'Project management', 'Tooling'],
  },
  /* Information Technology */
  {
    slug: 'campus-wifi-coverage-survey',
    name: 'Sidra Naz',
    classOf: 2024,
    programme: 'bs-information-technology',
    kind: 'Final-year project',
    headline: 'Mapping wireless coverage across a campus and where to add access points',
    summary:
      'The project measures signal strength in buildings and walkways and draws a coverage map. It proposes where extra access points would help most, with the cost of each option.',
    tags: ['Networks', 'Wireless', 'Campus IT'],
  },
  {
    slug: 'low-cost-security-for-small-offices',
    name: 'Rashid Ali',
    classOf: 2023,
    programme: 'bs-information-technology',
    kind: 'Thesis',
    headline: 'A low-cost security set-up for small offices with open-source tools',
    summary:
      'The thesis puts together a firewall, backup and update plan for a ten-person office using free tools. It tests the set-up against common attacks and writes a checklist an office manager can follow.',
    tags: ['Cyber security', 'Open source', 'Small business'],
  },
  {
    slug: 'smart-water-tank-monitor',
    name: 'Faiza Gul',
    classOf: 2025,
    programme: 'bs-information-technology',
    kind: 'Final-year project',
    headline: 'A sensor and phone alert system that tells households when the water tank runs low',
    summary:
      'A float sensor and a small board send the tank level to a phone app, which warns before the tank empties. The project compares two ways of sending the reading when mobile signal is weak.',
    tags: ['Internet of Things', 'Sensors', 'Mobile'],
  },
  /* Data Science */
  {
    slug: 'predicting-apple-crop-yield',
    name: 'Noman Khan',
    classOf: 2024,
    programme: 'bs-data-science',
    kind: 'Thesis',
    headline: 'Predicting orchard yield from weather records and satellite images',
    summary:
      'The thesis joins ten years of weather readings with satellite vegetation images to predict the yield of orchards in the district. It compares simple regression with tree-based models and explains which inputs matter most.',
    tags: ['Machine learning', 'Agriculture', 'Remote sensing'],
  },
  {
    slug: 'exam-results-dashboard',
    name: 'Laiba Tariq',
    classOf: 2023,
    programme: 'bs-data-science',
    kind: 'Final-year project',
    headline: 'A dashboard that shows where students struggle across courses and semesters',
    summary:
      'The project turns anonymised result sheets into charts of pass rates by course, semester and section. Instructors can see which topics need extra sessions. No student is named on any chart.',
    tags: ['Dashboards', 'Education data', 'Visualisation'],
  },
  {
    slug: 'flood-rainfall-pattern-analysis',
    name: 'Usman Ghani',
    classOf: 2025,
    programme: 'bs-data-science',
    kind: 'Research paper',
    headline: 'Looking for early rainfall patterns that come before flooding in the Swat river basin',
    summary:
      'The paper studies daily rainfall and river-level records and looks for patterns in the days before high water. It reports which warning signs held up on data the model had not seen.',
    tags: ['Time series', 'Climate', 'Flood warning'],
  },
  /* Artificial Intelligence */
  {
    slug: 'urdu-handwriting-recognition',
    name: 'Mariam Ahmad',
    classOf: 2024,
    programme: 'bs-artificial-intelligence',
    kind: 'Thesis',
    headline: 'Teaching a neural network to read handwritten Urdu numerals and words',
    summary:
      'The thesis trains a small neural network on handwriting samples collected from students and compares it with a larger pretrained model. It reports where each model makes mistakes and how much data was needed.',
    tags: ['Deep learning', 'Urdu', 'Computer vision'],
  },
  {
    slug: 'crop-disease-detection-from-photos',
    name: 'Adnan Hussain',
    classOf: 2025,
    programme: 'bs-artificial-intelligence',
    kind: 'Final-year project',
    headline: 'A phone app that spots common leaf diseases in crops from one photograph',
    summary:
      'A farmer takes a photo of a leaf and the app names the likely disease and suggests a next step. The model runs on the phone, so it works in fields with no signal. Accuracy was checked on photos the model had not seen.',
    tags: ['Computer vision', 'Agriculture', 'On-device AI'],
  },
  {
    slug: 'answering-admission-questions-in-urdu',
    name: 'Rabia Anwar',
    classOf: 2023,
    programme: 'bs-artificial-intelligence',
    kind: 'Research paper',
    headline: 'A question-answering assistant for admission queries in Urdu and English',
    summary:
      'The paper builds an assistant that answers common admission questions from the published prospectus. It measures how often the answer was right and how often it correctly said it did not know.',
    tags: ['Language models', 'Urdu', 'Question answering'],
  },
]

export const alumniWork = (slug: string) => ALUMNI_WORKS.find((w) => w.slug === slug) ?? null

/** The work of alumni of one programme, newest class first. */
export const alumniForProgramme = (programme: string) =>
  ALUMNI_WORKS.filter((w) => w.programme === programme).sort((a, b) => b.classOf - a.classOf)

/** Three for the department page: the first of each of three programmes, so the department shows a spread. */
export const DCST_FEATURED = [
  'pashto-spelling-checker',
  'clinic-queue-and-records-app',
  'crop-disease-detection-from-photos',
]
export const alumniBySlugs = (slugs: string[]) =>
  slugs.flatMap((s) => {
    const w = alumniWork(s)
    return w ? [w] : []
  })
