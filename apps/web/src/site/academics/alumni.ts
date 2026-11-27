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

/** Three stand-in portraits supplied by the owner on 2026-11-24 (not real alumni). Each programme page shows them in turn, so a page never
    shows the same face twice. Replace an entry's `photo` with the alumnus's own portrait when the department supplies it. */
export const SAMPLE_PORTRAITS = [
  '/images/alumni/sample-portrait-1.webp',
  '/images/alumni/sample-portrait-2.webp',
  '/images/alumni/sample-portrait-3.webp',
]

export const ALUMNI_PATH = '/academics/alumni-work'
export const alumniHref = (slug: string) => `${ALUMNI_PATH}/${slug}`

export const ALUMNI_WORKS: AlumniWork[] = [
  /* Computer Science */
  {
    slug: 'graph-routing-for-valley-transport',
    name: 'Asif Rehman',
    classOf: 2024,
    programme: 'bs-computer-science',
    photo: SAMPLE_PORTRAITS[1],
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
    photo: SAMPLE_PORTRAITS[2],
    kind: 'Research paper',
    headline: 'A spelling checker for Pashto text built from a word list and edit distance',
    summary:
      'The paper builds a word list from public Pashto text and suggests corrections for misspelt words using edit distance. It reports how many of the correct words appear among the first three suggestions on a hand-checked test set.',
    tags: ['Natural language processing', 'Pashto', 'Text'],
  },
  {
    slug: 'compiler-for-a-teaching-language',
    name: 'Zubair Khan',
    classOf: 2025,
    programme: 'bs-computer-science',
    photo: SAMPLE_PORTRAITS[0],
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
    photo: SAMPLE_PORTRAITS[1],
    kind: 'Final-year project',
    headline: 'A queue and patient-record app for a small rural clinic that works without internet',
    summary:
      'The team built an app that keeps the clinic queue and visit notes on the device and syncs when a connection returns. The report covers requirements gathering with clinic staff, testing in the field and what changed after the first week of use.',
    tags: ['Mobile apps', 'Offline first', 'Health'],
  },
  {
    slug: 'automated-testing-for-student-portals',
    name: 'Mehran Shah',
    classOf: 2023,
    programme: 'bs-software-engineering',
    photo: SAMPLE_PORTRAITS[2],
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
    photo: SAMPLE_PORTRAITS[0],
    kind: 'Final-year project',
    headline: 'A light requirements tool that links each feature request to its tests and tasks',
    summary:
      'The project gives small teams one place to write a requirement, see the tasks built for it and see which tests prove it works. A user study with two class project teams compared it with a shared spreadsheet.',
    tags: ['Requirements', 'Project management', 'Tooling'],
  },
  /* Information Technology */
  {
    slug: 'campus-wifi-coverage-survey',
    name: 'Saad Nawaz',
    classOf: 2024,
    programme: 'bs-information-technology',
    photo: SAMPLE_PORTRAITS[1],
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
    photo: SAMPLE_PORTRAITS[2],
    kind: 'Thesis',
    headline: 'A low-cost security set-up for small offices with open-source tools',
    summary:
      'The thesis puts together a firewall, backup and update plan for a ten-person office using free tools. It tests the set-up against common attacks and writes a checklist an office manager can follow.',
    tags: ['Cyber security', 'Open source', 'Small business'],
  },
  {
    slug: 'smart-water-tank-monitor',
    name: 'Farhan Gul',
    classOf: 2025,
    programme: 'bs-information-technology',
    photo: SAMPLE_PORTRAITS[0],
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
    photo: SAMPLE_PORTRAITS[1],
    kind: 'Thesis',
    headline: 'Predicting orchard yield from weather records and satellite images',
    summary:
      'The thesis joins ten years of weather readings with satellite vegetation images to predict the yield of orchards in the district. It compares simple regression with tree-based models and explains which inputs matter most.',
    tags: ['Machine learning', 'Agriculture', 'Remote sensing'],
  },
  {
    slug: 'exam-results-dashboard',
    name: 'Luqman Tariq',
    classOf: 2023,
    programme: 'bs-data-science',
    photo: SAMPLE_PORTRAITS[2],
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
    photo: SAMPLE_PORTRAITS[0],
    kind: 'Research paper',
    headline: 'Looking for early rainfall patterns that come before flooding in the Swat river basin',
    summary:
      'The paper studies daily rainfall and river-level records and looks for patterns in the days before high water. It reports which warning signs held up on data the model had not seen.',
    tags: ['Time series', 'Climate', 'Flood warning'],
  },
  /* Artificial Intelligence */
  {
    slug: 'urdu-handwriting-recognition',
    name: 'Mazhar Ahmad',
    classOf: 2024,
    programme: 'bs-artificial-intelligence',
    photo: SAMPLE_PORTRAITS[1],
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
    photo: SAMPLE_PORTRAITS[0],
    kind: 'Final-year project',
    headline: 'A phone app that spots common leaf diseases in crops from one photograph',
    summary:
      'A farmer takes a photo of a leaf and the app names the likely disease and suggests a next step. The model runs on the phone, so it works in fields with no signal. Accuracy was checked on photos the model had not seen.',
    tags: ['Computer vision', 'Agriculture', 'On-device AI'],
  },
  {
    slug: 'answering-admission-questions-in-urdu',
    name: 'Raheel Anwar',
    classOf: 2023,
    programme: 'bs-artificial-intelligence',
    photo: SAMPLE_PORTRAITS[2],
    kind: 'Research paper',
    headline: 'A question-answering assistant for admission queries in Urdu and English',
    summary:
      'The paper builds an assistant that answers common admission questions from the published prospectus. It measures how often the answer was right and how often it correctly said it did not know.',
    tags: ['Language models', 'Urdu', 'Question answering'],
  },
  /* Allied Health Sciences */
  {
    slug: 'clinical-chemistry-quality-audit',
    name: 'Jawad Ahmad',
    classOf: 2025,
    photo: SAMPLE_PORTRAITS[0],
    programme: 'bs-medical-laboratory-technology',
    kind: 'Final-year project',
    headline: 'Auditing the quality of routine blood chemistry tests in a district laboratory',
    summary:
      'The project checks a laboratory’s daily controls and repeat tests over three months and lists where results drifted. It ends with a one-page routine that the laboratory staff can follow to catch drift sooner.',
    tags: ['Quality control', 'Clinical chemistry', 'Audit'],
  },
  {
    slug: 'anaemia-screening-in-schoolchildren',
    name: 'Faisal Rahim',
    classOf: 2024,
    photo: SAMPLE_PORTRAITS[1],
    programme: 'bs-medical-laboratory-technology',
    kind: 'Research paper',
    headline: 'Screening schoolchildren for anaemia with a simple blood count and iron check',
    summary:
      'The paper describes a school screening day: a finger-prick blood count followed by an iron test for children with low readings. It reports how many children needed follow-up and how the process could be shortened.',
    tags: ['Haematology', 'Public health', 'Screening'],
  },
  {
    slug: 'water-borne-bacteria-in-village-wells',
    name: 'Salman Khalil',
    classOf: 2023,
    photo: SAMPLE_PORTRAITS[2],
    programme: 'bs-medical-laboratory-technology',
    kind: 'Thesis',
    headline: 'Finding disease-causing bacteria in village well water across a valley',
    summary:
      'The thesis collects well-water samples from villages and cultures them for common disease-causing bacteria. It compares results before and after a simple chlorine treatment and explains the findings to the village committees.',
    tags: ['Microbiology', 'Water quality', 'Infection control'],
  },
  {
    slug: 'dental-crown-fit-checking',
    name: 'Waqar Alam',
    classOf: 2025,
    photo: SAMPLE_PORTRAITS[0],
    programme: 'bs-dental-technology',
    kind: 'Final-year project',
    headline: 'A simple jig for checking how well a crown fits before it leaves the laboratory',
    summary:
      'The project builds a low-cost jig that holds a crown on its die and measures the gap at the edge. Technologists tried it on a set of crowns and compared the readings with a dentist’s check.',
    tags: ['Crowns', 'Quality check', 'Dental laboratory'],
  },
  {
    slug: 'denture-acrylic-strength-comparison',
    name: 'Tahir Mehmood',
    classOf: 2024,
    photo: SAMPLE_PORTRAITS[1],
    programme: 'bs-dental-technology',
    kind: 'Thesis',
    headline: 'Comparing the strength of denture acrylics after repeated heating and cooling',
    summary:
      'The thesis makes test bars from three denture acrylics and cycles them between hot and cold water. It compares how much each weakens and what that means for dentures worn in hot and cold seasons.',
    tags: ['Biomaterials', 'Dentures', 'Testing'],
  },
  {
    slug: 'low-cost-digital-impression-workflow',
    name: 'Owais Hassan',
    classOf: 2023,
    photo: SAMPLE_PORTRAITS[2],
    programme: 'bs-dental-technology',
    kind: 'Research paper',
    headline: 'A low-cost route from a digital impression to a printed dental model',
    summary:
      'The paper sets out the steps from a scanned impression to a printed model using affordable equipment. It compares the printed models with plaster ones for accuracy and cost.',
    tags: ['Digital dentistry', '3D printing', 'Cost'],
  },
  {
    slug: 'gait-analysis-after-knee-injury',
    name: 'Danish Iqbal',
    classOf: 2025,
    photo: SAMPLE_PORTRAITS[0],
    programme: 'doctor-of-physical-therapy',
    kind: 'Thesis',
    headline: 'Measuring how people walk after a knee injury with a phone camera',
    summary:
      'The thesis films patients walking and measures their knee movement with free video-analysis software. It compares the readings with a therapist’s observations and shows how recovery can be tracked between visits.',
    tags: ['Gait', 'Knee injury', 'Rehabilitation'],
  },
  {
    slug: 'home-exercise-programme-after-stroke',
    name: 'Ihsan Ullah',
    classOf: 2024,
    photo: SAMPLE_PORTRAITS[1],
    programme: 'doctor-of-physical-therapy',
    kind: 'Research paper',
    headline: 'A home exercise programme for stroke patients in villages with no clinic',
    summary:
      'The paper designs a set of exercises that a family member can help with at home, with picture cards in Pashto and Urdu. It reports how well patients kept to the programme over eight weeks.',
    tags: ['Stroke', 'Community care', 'Exercise'],
  },
  {
    slug: 'back-pain-among-office-workers',
    name: 'Naveed Khan',
    classOf: 2023,
    photo: SAMPLE_PORTRAITS[2],
    programme: 'doctor-of-physical-therapy',
    kind: 'Final-year project',
    headline: 'Back pain among office and school staff, and which stretching routine helps most',
    summary:
      'The project surveys staff in offices and schools about back pain and tries two short stretching routines for six weeks. It reports which routine staff found easier to keep up and how their pain scores changed.',
    tags: ['Back pain', 'Ergonomics', 'Prevention'],
  },
  {
    slug: 'ct-dose-for-children-audit',
    name: 'Yasir Ali',
    classOf: 2025,
    photo: SAMPLE_PORTRAITS[0],
    programme: 'bs-radiography-and-imaging-technology',
    kind: 'Final-year project',
    headline: 'Checking radiation doses for children’s CT scans against reference levels',
    summary:
      'The project collects the settings and doses of children’s CT scans in one hospital and compares them with published reference levels. It suggests settings to bring the highest doses down.',
    tags: ['CT', 'Radiation dose', 'Children'],
  },
  {
    slug: 'chest-xray-positioning-errors',
    name: 'Rehman Gul',
    classOf: 2024,
    photo: SAMPLE_PORTRAITS[1],
    programme: 'bs-radiography-and-imaging-technology',
    kind: 'Research paper',
    headline: 'Counting positioning errors in chest X-rays and why they lead to repeat exposures',
    summary:
      'The paper reviews rejected chest X-ray images and sorts the reasons, such as rotation, poor breath-hold and cut-off lungs. It proposes a checklist for the technologist to use before each exposure.',
    tags: ['X-ray', 'Positioning', 'Repeat exposures'],
  },
  {
    slug: 'ultrasound-practice-simulator',
    name: 'Sheraz Khan',
    classOf: 2023,
    photo: SAMPLE_PORTRAITS[2],
    programme: 'bs-radiography-and-imaging-technology',
    kind: 'Thesis',
    headline: 'A low-cost simulator to practise ultrasound scanning before working with patients',
    summary:
      'The thesis builds a practice phantom from gelatin and household materials with hidden shapes to find. Students scanned it and rated how realistic and useful it was for learning probe control.',
    tags: ['Ultrasound', 'Training', 'Simulation'],
  },
]

export const alumniWork = (slug: string) => ALUMNI_WORKS.find((w) => w.slug === slug) ?? null

/** The work of alumni of one programme, newest class first. */
export const alumniForProgramme = (programme: string) =>
  ALUMNI_WORKS.filter((w) => w.programme === programme).sort((a, b) => b.classOf - a.classOf)

export const alumniBySlugs = (slugs: string[]) =>
  slugs.flatMap((s) => {
    const w = alumniWork(s)
    return w ? [w] : []
  })
