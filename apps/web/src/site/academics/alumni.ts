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
  /* Physics */
  {
    slug: 'thin-film-conductivity-measurement',
    name: 'Adnan Shah',
    classOf: 2025,
    photo: SAMPLE_PORTRAITS[0],
    programme: 'bs-physics-2',
    kind: 'Final-year project',
    headline: 'Measuring how the conductivity of a thin metal film changes with its thickness',
    summary:
      'The project deposits films of increasing thickness on glass slides and measures their resistance with a four-point probe. It shows where the film stops behaving like the bulk metal and explains the trend with a simple model.',
    tags: ['Thin films', 'Conductivity', 'Materials'],
  },
  {
    slug: 'low-cost-solar-radiation-logger',
    name: 'Zubair Khan',
    classOf: 2024,
    photo: SAMPLE_PORTRAITS[1],
    programme: 'bs-physics-2',
    kind: 'Thesis',
    headline: 'A low-cost logger that records sunlight through the day for a village solar plan',
    summary:
      'The thesis builds a small data logger from a light sensor and a microcontroller and compares its readings with a reference meter over a month. It reports the error of the cheap sensor and how it can be corrected.',
    tags: ['Solar energy', 'Electronics', 'Instrumentation'],
  },
  {
    slug: 'pendulum-motion-simulation',
    name: 'Hamid Ali',
    classOf: 2023,
    photo: SAMPLE_PORTRAITS[2],
    programme: 'bs-physics-2',
    kind: 'Research paper',
    headline: 'Simulating a damped pendulum to show when small-angle formulas fail',
    summary:
      'The paper solves the pendulum equation numerically with and without damping and compares it to the textbook small-angle result. It gives students a worked example of how large the error becomes as the angle grows.',
    tags: ['Simulation', 'Mechanics', 'Numerical methods'],
  },
  /* Chemistry */
  {
    slug: 'water-hardness-survey-swat-springs',
    name: 'Nadir Gul',
    classOf: 2025,
    photo: SAMPLE_PORTRAITS[0],
    programme: 'bs-chemistry-2',
    kind: 'Final-year project',
    headline: 'Testing the hardness of water from springs used for drinking in a valley',
    summary:
      'The project collects samples from springs and wells over two seasons and measures hardness and pH by titration. It lists which sources are within the guideline range and which need treatment.',
    tags: ['Water quality', 'Titration', 'Environment'],
  },
  {
    slug: 'green-synthesis-silver-nanoparticles',
    name: 'Habib Ullah',
    classOf: 2024,
    photo: SAMPLE_PORTRAITS[1],
    programme: 'bs-chemistry-2',
    kind: 'Thesis',
    headline: 'Making silver nanoparticles with a local plant extract instead of harsh chemicals',
    summary:
      'The thesis uses a leaf extract to reduce a silver salt to nanoparticles and checks the result with a spectrophotometer. It compares the particles made at three temperatures and reports which gave the most stable colour.',
    tags: ['Nanoparticles', 'Green chemistry', 'Spectroscopy'],
  },
  {
    slug: 'vitamin-c-content-local-fruits',
    name: 'Bilal Ahmad',
    classOf: 2023,
    photo: SAMPLE_PORTRAITS[2],
    programme: 'bs-chemistry-2',
    kind: 'Research paper',
    headline: 'Comparing the vitamin C content of fruits grown in the district',
    summary:
      'The paper measures vitamin C in ripe and unripe fruit by titration and shows how the content falls with storage. It ends with simple storage advice for sellers.',
    tags: ['Analytical chemistry', 'Food', 'Titration'],
  },
  /* Mathematics and Statistics */
  {
    slug: 'numerical-solution-of-heat-flow',
    name: 'Waqas Ahmad',
    classOf: 2025,
    photo: SAMPLE_PORTRAITS[0],
    programme: 'bs-mathematics-2',
    kind: 'Final-year project',
    headline: 'Solving heat flow along a metal rod with a finite-difference method',
    summary:
      'The project writes the heat equation as a grid of simple updates and solves it in Python for different rods and ends. It compares the answer with the exact solution and shows when the method becomes unstable.',
    tags: ['Differential equations', 'Numerical methods', 'Python'],
  },
  {
    slug: 'household-income-survey-swat',
    name: 'Ikram Ullah',
    classOf: 2024,
    photo: SAMPLE_PORTRAITS[1],
    programme: 'bs-statistics',
    kind: 'Thesis',
    headline: 'Estimating average household spending from a small survey in one union council',
    summary:
      'The thesis designs a stratified sample, collects answers from households and compares three estimators of the average. It reports the margin of error and how the sample would change for a larger area.',
    tags: ['Sampling', 'Survey', 'Estimation'],
  },
  {
    slug: 'rainfall-trend-analysis-swat',
    name: 'Fawad Khan',
    classOf: 2023,
    photo: SAMPLE_PORTRAITS[2],
    programme: 'bs-statistics',
    kind: 'Research paper',
    headline: 'Finding a trend in monthly rainfall records for the district',
    summary:
      'The paper applies a simple trend test and a moving average to rainfall records and shows which months have changed. It explains why a trend in noisy data needs a test before it is called a trend.',
    tags: ['Time series', 'Climate', 'Trend analysis'],
  },
  {
    slug: 'matrix-methods-for-network-flow',
    name: 'Sajid Ali',
    classOf: 2024,
    photo: SAMPLE_PORTRAITS[1],
    programme: 'bs-mathematics-2',
    kind: 'Thesis',
    headline: 'Using matrices to find the busiest road in a small town network',
    summary:
      'The thesis writes a town’s road network as a matrix and uses linear algebra to rank junctions by how much traffic passes through. It compares the ranking with a manual count at five junctions.',
    tags: ['Linear algebra', 'Networks', 'Modelling'],
  },
  {
    slug: 'fixed-point-methods-for-nonlinear-equations',
    name: 'Naeem Khan',
    classOf: 2023,
    photo: SAMPLE_PORTRAITS[2],
    programme: 'bs-mathematics-2',
    kind: 'Research paper',
    headline: 'Comparing three fixed-point methods for solving nonlinear equations',
    summary:
      'The paper tests three iteration schemes on the same set of equations and counts the steps each needs to reach a given accuracy. It gives a table showing which method is safest to try first.',
    tags: ['Numerical analysis', 'Iteration', 'Convergence'],
  },
  {
    slug: 'student-marks-regression-analysis',
    name: 'Tariq Aziz',
    classOf: 2025,
    photo: SAMPLE_PORTRAITS[0],
    programme: 'bs-statistics',
    kind: 'Final-year project',
    headline: 'Which study habits predict marks? A regression on a survey of university students',
    summary:
      'The project surveys students on hours of study, sleep and attendance and fits a regression to their marks. It reports which factors matter most and how well the model predicts a new student.',
    tags: ['Regression', 'Survey', 'Education'],
  },
  {
    slug: 'medicinal-plants-sold-in-local-markets',
    name: 'Hamza Khalil',
    classOf: 2025,
    photo: SAMPLE_PORTRAITS[0],
    programme: 'bs-botany-2',
    kind: 'Final-year project',
    headline: 'A field survey of the medicinal plants sold in three local markets',
    summary:
      'The project visits three markets, lists the plants on sale and asks sellers what each is used for. It ends with a table of the twenty most common species and the parts that are sold.',
    tags: ['Ethnobotany', 'Medicinal plants', 'Survey'],
  },
  {
    slug: 'pine-forest-understorey-herbarium',
    name: 'Shoaib Iqbal',
    classOf: 2024,
    photo: SAMPLE_PORTRAITS[1],
    programme: 'bs-botany-2',
    kind: 'Thesis',
    headline: 'Building a herbarium of the understorey plants of a mixed pine forest',
    summary:
      'The thesis collects, presses and identifies the plants growing beneath a mixed pine stand across two seasons. It deposits the mounted sheets in the department collection with a short key.',
    tags: ['Herbarium', 'Taxonomy', 'Forest ecology'],
  },
  {
    slug: 'salt-stress-and-wheat-germination',
    name: 'Adnan Rauf',
    classOf: 2023,
    photo: SAMPLE_PORTRAITS[2],
    programme: 'bs-botany-2',
    kind: 'Research paper',
    headline: 'How salt in the soil changes the germination of wheat seed',
    summary:
      'The paper germinates wheat seed in solutions of rising salt strength and records how many seeds sprout and how fast. It shows the point at which germination falls sharply.',
    tags: ['Plant physiology', 'Salt stress', 'Wheat'],
  },
  {
    slug: 'fish-species-in-one-river-reach',
    name: 'Faizan Ahmad',
    classOf: 2025,
    photo: SAMPLE_PORTRAITS[0],
    programme: 'bs-zoology-2',
    kind: 'Final-year project',
    headline: 'A seasonal survey of fish species in one reach of the river',
    summary:
      'The project nets fish at one site in each season and records species, length and number. It reports which species are common all year and which appear only in spring.',
    tags: ['Fisheries', 'Survey', 'Aquatic biology'],
  },
  {
    slug: 'butterflies-of-orchard-and-forest',
    name: 'Junaid Rahim',
    classOf: 2024,
    photo: SAMPLE_PORTRAITS[1],
    programme: 'bs-zoology-2',
    kind: 'Thesis',
    headline: 'Comparing butterfly counts in an orchard and in a nearby forest',
    summary:
      'The thesis walks fixed paths in both habitats through a season and counts the butterflies it sees. It compares the two sites and suggests which flowers draw the most visitors.',
    tags: ['Entomology', 'Biodiversity', 'Field survey'],
  },
  {
    slug: 'gut-parasites-in-village-goats',
    name: 'Wasim Ali',
    classOf: 2023,
    photo: SAMPLE_PORTRAITS[2],
    programme: 'bs-zoology-2',
    kind: 'Research paper',
    headline: 'Gut parasites in goats from three villages and the effect of season',
    summary:
      'The paper examines dung samples from goats in three villages in summer and winter. It reports how many animals carry parasites and how the rate changes with the season.',
    tags: ['Parasitology', 'Livestock', 'Health'],
  },
  {
    slug: 'low-cost-medium-for-plantlet-culture',
    name: 'Zeeshan Ullah',
    classOf: 2025,
    photo: SAMPLE_PORTRAITS[0],
    programme: 'bs-biotechnology-3',
    kind: 'Final-year project',
    headline: 'Growing plantlets from cut shoots on a low-cost culture medium',
    summary:
      'The project compares a standard tissue culture medium with a cheaper one on cut shoots. It records survival and growth over six weeks and notes where the cheaper medium falls short.',
    tags: ['Tissue culture', 'Plant biotechnology', 'Cost'],
  },
  {
    slug: 'dna-extraction-methods-compared',
    name: 'Mubashir Khan',
    classOf: 2024,
    photo: SAMPLE_PORTRAITS[1],
    programme: 'bs-biotechnology-3',
    kind: 'Thesis',
    headline: 'Comparing three methods of extracting DNA from plant leaves',
    summary:
      'The thesis extracts DNA from the same leaves by three methods and measures the amount and purity of each. It recommends the method that is quickest for a teaching laboratory.',
    tags: ['DNA extraction', 'Methods', 'Laboratory'],
  },
  {
    slug: 'bioethanol-from-fruit-waste',
    name: 'Arbab Hussain',
    classOf: 2023,
    photo: SAMPLE_PORTRAITS[2],
    programme: 'bs-biotechnology-3',
    kind: 'Research paper',
    headline: 'Making bioethanol from fruit waste with yeast',
    summary:
      'The paper ferments waste from a fruit market with yeast and measures how much ethanol forms in each batch. It shows which waste and which temperature gave the best yield.',
    tags: ['Fermentation', 'Bioprocessing', 'Waste'],
  },
  {
    slug: 'pedigree-survey-of-inherited-traits',
    name: 'Shahzad Ali',
    classOf: 2025,
    photo: SAMPLE_PORTRAITS[0],
    programme: 'bs-genetics-3',
    kind: 'Final-year project',
    headline: 'A pedigree survey of inherited traits in student families',
    summary:
      'The project collects family trees from volunteer students for a few visible traits and works out how each is inherited. It explains where the simple patterns hold and where they do not.',
    tags: ['Pedigree', 'Inheritance', 'Survey'],
  },
  {
    slug: 'pcr-detection-of-a-common-gene-variant',
    name: 'Imran Zeb',
    classOf: 2024,
    photo: SAMPLE_PORTRAITS[1],
    programme: 'bs-genetics-3',
    kind: 'Thesis',
    headline: 'Detecting a common gene variant with PCR and gel electrophoresis',
    summary:
      'The thesis sets up a PCR test for one well-known variant and runs it on DNA from volunteers. It reports how often the variant appears and how reliable the test is.',
    tags: ['PCR', 'Gel electrophoresis', 'Genotyping'],
  },
  {
    slug: 'allele-frequencies-in-a-district-sample',
    name: 'Noman Akhtar',
    classOf: 2023,
    photo: SAMPLE_PORTRAITS[2],
    programme: 'bs-genetics-3',
    kind: 'Research paper',
    headline: 'Allele frequencies for a blood-group gene in a district sample',
    summary:
      'The paper counts blood-group types in a sample of students and estimates the frequency of each allele. It checks whether the sample fits the Hardy-Weinberg expectation.',
    tags: ['Population genetics', 'Blood groups', 'Statistics'],
  },
  {
    slug: 'bacteria-in-roadside-drinking-water',
    name: 'Talha Mehmood',
    classOf: 2025,
    photo: SAMPLE_PORTRAITS[0],
    programme: 'bs-microbiology-3',
    kind: 'Final-year project',
    headline: 'Counting bacteria in drinking water served at roadside stalls',
    summary:
      'The project collects water from stalls on one road and counts the coliform bacteria in each sample. It reports how many samples fall within the safe limit and what a stallholder can do to improve.',
    tags: ['Water quality', 'Coliforms', 'Public health'],
  },
  {
    slug: 'antibiotic-sensitivity-in-clinic-samples',
    name: 'Yasir Naeem',
    classOf: 2024,
    photo: SAMPLE_PORTRAITS[1],
    programme: 'bs-microbiology-3',
    kind: 'Thesis',
    headline: 'Antibiotic sensitivity of bacteria grown from clinic samples',
    summary:
      'The thesis grows bacteria from anonymised clinic samples and tests each against a set of antibiotics. It reports which drugs still work and which bacteria resist several at once.',
    tags: ['Antibiotics', 'Resistance', 'Clinical'],
  },
  {
    slug: 'plant-extracts-against-skin-bacteria',
    name: 'Owais Rahman',
    classOf: 2023,
    photo: SAMPLE_PORTRAITS[2],
    programme: 'bs-microbiology-3',
    kind: 'Research paper',
    headline: 'Testing plant extracts against bacteria that infect the skin',
    summary:
      'The paper tests extracts of four local plants against two skin bacteria and measures the clear zones around each. It names the extract that stopped growth best.',
    tags: ['Antimicrobials', 'Plant extracts', 'Bacteria'],
  },
  {
    slug: 'exam-stress-among-university-students',
    name: 'Haris Wazir',
    classOf: 2025,
    photo: SAMPLE_PORTRAITS[0],
    programme: 'bs-psychology-2',
    kind: 'Final-year project',
    headline: 'How stressed are students in the weeks before exams? A questionnaire study',
    summary:
      'The project asks students to fill in a short stress scale two weeks and two days before exams. It reports how scores change and which coping habits go with lower stress.',
    tags: ['Stress', 'Coping', 'Questionnaire'],
  },
  {
    slug: 'screen-time-and-sleep-in-adolescents',
    name: 'Daniyal Khan',
    classOf: 2024,
    photo: SAMPLE_PORTRAITS[1],
    programme: 'bs-psychology-2',
    kind: 'Thesis',
    headline: 'Screen time and sleep in school-age adolescents',
    summary:
      'The thesis surveys pupils from two schools on daily screen time and sleep. It reports the link between the two and notes what the survey cannot show about cause.',
    tags: ['Sleep', 'Adolescents', 'Survey'],
  },
  {
    slug: 'a-short-scale-for-study-motivation',
    name: 'Bilal Sarwar',
    classOf: 2023,
    photo: SAMPLE_PORTRAITS[2],
    programme: 'bs-psychology-2',
    kind: 'Research paper',
    headline: 'Building and checking a short scale for study motivation',
    summary:
      'The paper writes twelve items on why students study, tests them on a sample and keeps the items that hold together. It reports how reliable the final scale is.',
    tags: ['Scale development', 'Motivation', 'Reliability'],
  },
  {
    slug: 'deodar-growth-rings-on-one-slope',
    name: 'Atif Ullah',
    classOf: 2025,
    photo: SAMPLE_PORTRAITS[0],
    programme: 'bs-forestry',
    kind: 'Final-year project',
    headline: 'Measuring annual growth rings in deodar trees from one slope',
    summary:
      'The project takes small cores from deodar trees on one slope, sands them and measures the ring widths. It shows which years were wide or narrow and compares them with rainfall records.',
    tags: ['Tree rings', 'Deodar', 'Climate'],
  },
  {
    slug: 'forest-cover-change-from-satellite-images',
    name: 'Kamran Haider',
    classOf: 2024,
    photo: SAMPLE_PORTRAITS[1],
    programme: 'bs-forestry',
    kind: 'Thesis',
    headline: 'Forest cover change in a mountain valley seen from satellite images',
    summary:
      'The thesis classifies satellite images from two dates and maps where forest was lost or gained. It reports the change in hectares and the areas that need attention.',
    tags: ['GIS', 'Remote sensing', 'Forest cover'],
  },
  {
    slug: 'stream-flow-and-forest-cover',
    name: 'Sohail Anwar',
    classOf: 2023,
    photo: SAMPLE_PORTRAITS[2],
    programme: 'bs-forestry',
    kind: 'Research paper',
    headline: 'Stream flow and forest cover in two small watersheds',
    summary:
      'The paper compares the flow of two streams after rain, one in a well-forested watershed and one in a thinner one. It reports how forest cover steadies the flow.',
    tags: ['Hydrology', 'Watershed', 'Forest cover'],
  },
  {
    slug: 'rock-units-along-a-road-cut',
    name: 'Idrees Khalil',
    classOf: 2025,
    photo: SAMPLE_PORTRAITS[0],
    programme: 'bs-geology-2',
    kind: 'Final-year project',
    headline: 'Mapping the rock units exposed along one road cut',
    summary:
      'The project walks a road cut, logs each rock unit and draws a section showing how the layers lie. It ends with a map and a short description of every unit.',
    tags: ['Mapping', 'Stratigraphy', 'Field geology'],
  },
  {
    slug: 'slope-stability-near-a-village',
    name: 'Rauf Anwar',
    classOf: 2024,
    photo: SAMPLE_PORTRAITS[1],
    programme: 'bs-geology-2',
    kind: 'Thesis',
    headline: 'A first look at slope stability above a mountain village',
    summary:
      'The thesis measures slope angle, rock type and cracks at ten points above a village and ranks them by landslide risk. It suggests which slopes the village should watch first.',
    tags: ['Slope stability', 'Hazards', 'Engineering geology'],
  },
  {
    slug: 'heavy-minerals-in-river-sand',
    name: 'Anas Mehmood',
    classOf: 2023,
    photo: SAMPLE_PORTRAITS[2],
    programme: 'bs-geology-2',
    kind: 'Research paper',
    headline: 'Heavy minerals in the sand of a mountain river',
    summary:
      'The paper separates the heavy minerals from sand samples taken along a river. It compares the mix at each site and links it to the rocks upstream.',
    tags: ['Mineralogy', 'Sedimentology', 'River sand'],
  },
  {
    slug: 'stone-sculpture-survey-of-a-valley-village',
    name: 'Hassan Raza',
    classOf: 2025,
    photo: SAMPLE_PORTRAITS[0],
    programme: 'bs-archaeology',
    kind: 'Final-year project',
    headline: 'Recording carved stones found in one valley village',
    summary:
      'The project photographs, measures and describes carved stones in a village and marks each on a map. It proposes which pieces should be protected first.',
    tags: ['Survey', 'Documentation', 'Sculpture'],
  },
  {
    slug: 'coins-from-a-local-collection',
    name: 'Furqan Ahmad',
    classOf: 2024,
    photo: SAMPLE_PORTRAITS[1],
    programme: 'bs-archaeology',
    kind: 'Thesis',
    headline: 'Cataloguing coins from a private local collection',
    summary:
      'The thesis cleans, weighs and photographs the coins of one collection and sorts them by type and period. It gives a catalogue with a short note on each group.',
    tags: ['Numismatics', 'Catalogue', 'Collections'],
  },
  {
    slug: 'documenting-a-rock-inscription',
    name: 'Murtaza Ali',
    classOf: 2023,
    photo: SAMPLE_PORTRAITS[2],
    programme: 'bs-archaeology',
    kind: 'Research paper',
    headline: 'Documenting and reading an inscription on a roadside rock',
    summary:
      'The paper records an inscription with photographs and rubbings and offers a reading of its text. It discusses what it may say about the people who carved it.',
    tags: ['Epigraphy', 'Documentation', 'Heritage'],
  },
  {
    slug: 'river-water-quality-below-a-town',
    name: 'Shehzad Ali',
    classOf: 2025,
    photo: SAMPLE_PORTRAITS[0],
    programme: 'bs-environmental-sciences',
    kind: 'Final-year project',
    headline: 'Water quality in a river above and below a town',
    summary:
      'The project takes water samples above and below a town and tests pH, turbidity and bacteria. It shows how the river changes as it passes the town.',
    tags: ['Water quality', 'River', 'Sampling'],
  },
  {
    slug: 'household-waste-survey-in-a-neighbourhood',
    name: 'Qasim Nawaz',
    classOf: 2024,
    photo: SAMPLE_PORTRAITS[1],
    programme: 'bs-environmental-sciences',
    kind: 'Thesis',
    headline: 'What a neighbourhood throws away: a household waste survey',
    summary:
      'The thesis weighs and sorts the waste of fifty households for a week. It reports how much is food, plastic and paper and what could be recycled.',
    tags: ['Solid waste', 'Survey', 'Recycling'],
  },
  {
    slug: 'a-plant-that-takes-up-heavy-metals',
    name: 'Rizwan Gul',
    classOf: 2023,
    photo: SAMPLE_PORTRAITS[2],
    programme: 'bs-environmental-sciences',
    kind: 'Research paper',
    headline: 'Testing a local plant for taking up heavy metals from soil',
    summary:
      'The paper grows a local plant in soil with known amounts of metal and measures how much the plant takes up. It judges whether the plant could help clean a site.',
    tags: ['Phytoremediation', 'Heavy metals', 'Plants'],
  },
  {
    slug: 'inflation-and-household-spending',
    name: 'Abdullah Zafar',
    classOf: 2025,
    photo: SAMPLE_PORTRAITS[0],
    programme: 'bs-economics-2',
    kind: 'Final-year project',
    headline: 'How rising prices changed household spending in one town',
    summary:
      'The project surveys households about what they cut back on when prices rose. It reports which items fell most and how income groups differ.',
    tags: ['Inflation', 'Households', 'Survey'],
  },
  {
    slug: 'remittances-and-village-schooling',
    name: 'Hammad Ullah',
    classOf: 2024,
    photo: SAMPLE_PORTRAITS[1],
    programme: 'bs-economics-2',
    kind: 'Thesis',
    headline: 'Do remittances keep children in school? A village study',
    summary:
      'The thesis compares schooling in households with and without a migrant family member. It estimates the link and discusses what else could explain it.',
    tags: ['Remittances', 'Education', 'Households'],
  },
  {
    slug: 'fuel-prices-and-transport-fares',
    name: 'Shayan Iqbal',
    classOf: 2023,
    photo: SAMPLE_PORTRAITS[2],
    programme: 'bs-economics-2',
    kind: 'Research paper',
    headline: 'Fuel prices and transport fares on one bus route',
    summary:
      'The paper follows fuel prices and bus fares on one route over three years. It estimates how quickly fares follow a change in the price of fuel.',
    tags: ['Fuel prices', 'Transport', 'Econometrics'],
  },
  {
    slug: 'microfinance-and-women-shopkeepers',
    name: 'Umair Khan',
    classOf: 2025,
    photo: SAMPLE_PORTRAITS[0],
    programme: 'bs-development-studies-2',
    kind: 'Final-year project',
    headline: 'Small loans and home shops: a study of microfinance users',
    summary:
      'The project interviews users of small loans who run shops from home. It reports what the loans were used for and what difficulties borrowers faced.',
    tags: ['Microfinance', 'Livelihoods', 'Interviews'],
  },
  {
    slug: 'school-dropout-in-a-union-council',
    name: 'Taimur Shah',
    classOf: 2024,
    photo: SAMPLE_PORTRAITS[1],
    programme: 'bs-development-studies-2',
    kind: 'Thesis',
    headline: 'Why pupils leave school early in one union council',
    summary:
      'The thesis asks pupils, parents and teachers why children drop out. It sorts the reasons by cost, distance and family need and suggests where a project could help.',
    tags: ['Education', 'Dropout', 'Community'],
  },
  {
    slug: 'a-small-grant-to-a-village-water-scheme',
    name: 'Ghazanfar Ali',
    classOf: 2023,
    photo: SAMPLE_PORTRAITS[2],
    programme: 'bs-development-studies-2',
    kind: 'Research paper',
    headline: 'Evaluating a small grant to a village water scheme',
    summary:
      'The paper compares water use and time spent collecting water before and after a small grant. It reports what changed and how well the scheme is kept up.',
    tags: ['Evaluation', 'Water', 'Rural development'],
  },
  {
    slug: 'voices-of-village-women-in-short-stories',
    name: 'Ammar Yasir',
    classOf: 2025,
    photo: SAMPLE_PORTRAITS[0],
    programme: 'bs-english-2',
    kind: 'Final-year project',
    headline: 'How village women are voiced in a set of short stories',
    summary:
      'The project reads six short stories and tracks who speaks, who is spoken for and how. It argues that the stories give women more voice than first appears.',
    tags: ['Short stories', 'Gender', 'Close reading'],
  },
  {
    slug: 'code-switching-in-classroom-talk',
    name: 'Raheel Saeed',
    classOf: 2024,
    photo: SAMPLE_PORTRAITS[1],
    programme: 'bs-english-2',
    kind: 'Thesis',
    headline: 'Switching between English and Pashto in a college classroom',
    summary:
      'The thesis records teacher and student talk in four classes and counts the switches between English and Pashto. It sorts them by purpose, such as explaining, joking and managing the class.',
    tags: ['Code-switching', 'Classroom', 'Sociolinguistics'],
  },
  {
    slug: 'a-reading-of-imagery-in-a-sonnet-sequence',
    name: 'Mudassir Hayat',
    classOf: 2023,
    photo: SAMPLE_PORTRAITS[2],
    programme: 'bs-english-2',
    kind: 'Research paper',
    headline: 'A reading of imagery in a sonnet sequence',
    summary:
      'The paper follows images of light and water through a sonnet sequence. It argues that they shape how the poems build their argument.',
    tags: ['Poetry', 'Imagery', 'Literary analysis'],
  },
  {
    slug: 'pricing-and-sales-in-a-local-market',
    name: 'Fahad Karim',
    classOf: 2025,
    photo: SAMPLE_PORTRAITS[0],
    programme: 'bba-hons-2',
    kind: 'Final-year project',
    headline: 'Pricing and sales in a local market: what shoppers say',
    summary:
      'The project surveys shoppers about price, quality and trust in a local market. It reports which of the three decides their purchases most.',
    tags: ['Pricing', 'Consumers', 'Survey'],
  },
  {
    slug: 'staff-turnover-in-small-firms',
    name: 'Sufyan Ali',
    classOf: 2024,
    photo: SAMPLE_PORTRAITS[1],
    programme: 'bba-hons-2',
    kind: 'Thesis',
    headline: 'Why staff leave small firms in one district',
    summary:
      'The thesis interviews owners and former employees of small firms. It sorts the reasons for leaving into pay, growth and treatment and suggests simple fixes.',
    tags: ['Human resources', 'Turnover', 'SMEs'],
  },
  {
    slug: 'online-selling-by-home-businesses',
    name: 'Kamil Rehman',
    classOf: 2023,
    photo: SAMPLE_PORTRAITS[2],
    programme: 'bba-hons-2',
    kind: 'Research paper',
    headline: 'Online selling by home businesses: what helps and what stops it',
    summary:
      'The paper surveys home businesses that sell on social media. It reports what helps them and the obstacles they face, such as delivery and payment.',
    tags: ['Digital marketing', 'Home businesses', 'E-commerce'],
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
