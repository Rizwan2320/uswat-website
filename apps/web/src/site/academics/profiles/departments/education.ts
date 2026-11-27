import { officeBanner, officeHero } from '../../../offices/art'
import type { DepartmentProfile, DisciplineProfile } from '../../types'
import { year } from '../core'
import { pictures } from '../sciences/core'

/* Department of Education and Staff Training, laid out like the DCST department page (the owner's blueprint, 2026-11-24).
   FROM THE UNIVERSITY'S PAGE, saved copy on the owner's Drive (read 2026-11-27; the copy dates from 2026-11-06): the introduction (set up in 2010 on the
   Vice Chancellor's directive; B.Ed 4-year since 2010; Associate Degree in Education and MPhil since spring 2019; PhD planned from spring 2025), the vision,
   the mission, the objectives, the four degrees, the eligibility lines, the six named staff and the mailbox.
   EVERYTHING ELSE (highlights, laboratories, research areas, careers, student life, questions and the study plan) is illustrative text for the template
   that nobody in the department has checked: `status: 'draft'`. Replace it, then set `reviewed`. */

const PAGE = 'https://uswat.edu.pk/department_of_education_and_staff_training/'
export const SLUG = 'education-and-staff-training'
export const BED = 'b-ed-hons'

const ELIGIBILITY = 'FA, F.Sc or A level (or equivalent) with a minimum of second division, and at least 45% marks in school subjects with A level.'

export const education: DepartmentProfile = {
  slug: SLUG,
  status: 'draft',
  shortName: 'Education and Staff Training',
  tagline: 'Teachers, teacher educators and researchers for Swat and Khyber Pakhtunkhwa.',
  intro: 'Pre-service teacher education since 2010: the B.Ed (Hons), the two-year Associate Degree in Education, the MPhil and a planned PhD.',
  hero: officeHero(SLUG),
  banner: officeBanner(SLUG, 'Department of Education and Staff Training. University of Swat.'),
  tile: officeHero(SLUG, 'Illustration for the Department of Education and Staff Training'),
  levelText: 'ADE to PhD',
  programmesLede: 'The page lists the B.Ed (Hons), the Associate Degree in Education (2-year), the MPhil in Education and a PhD in Education. The B.Ed (Hons) has a page of its own here.',
  about: [
    'The Department of Education and Staff Training was set up in 2010 on the directive of the Vice Chancellor, to meet the needs of prospective school teachers and university faculty through pre-service teacher education and training. It has offered the B.Ed (4-year) since 2010, and the Associate Degree in Education (2-year) and the MPhil in Education since spring 2019.',
    'Its page says a PhD programme is planned from spring 2025, to give people in Swat in particular and Khyber Pakhtunkhwa in general the chance of higher education, whatever their gender, caste or creed.',
    'The B.Ed (Hons), the Associate Degree and the MPhil aim to produce educational managers, teacher educators and researchers who can influence educational policy and practice in Pakistan and abroad.',
  ],
  vision: 'To work for a sustainable and peaceful society through quality education, relevant training and highly educated graduates, in close liaison with the community.',
  mission:
    'Because education is by nature emancipatory, the department strives, through qualified and skilled faculty and staff, to produce quality graduates who can be positive agents of change.',
  highlights: [
    { icon: 'cap', title: 'Teacher education since 2010', text: 'The B.Ed has run since the department was set up.' },
    { icon: 'book', title: 'From associate degree to PhD', text: 'The page lists ADE, B.Ed (Hons), MPhil and PhD in Education.' },
    { icon: 'users', title: 'Doctoral faculty', text: 'Five of the six named staff hold a PhD in education; the sixth is a PhD scholar.' },
    { icon: 'search', title: 'Research and policy', text: 'Graduates are meant to understand educational policy and practice.' },
    { icon: 'globe', title: 'Open to all', text: 'The page invites students whatever their gender, caste or creed.' },
    { icon: 'rocket', title: 'A planned PhD', text: 'A PhD programme is planned from spring 2025.' },
  ],
  disciplines: [BED],
  labs: [
    { title: 'Microteaching room', text: 'Practice lessons recorded and discussed with classmates and a supervisor.', art: officeHero(SLUG), tools: ['Camera', 'Whiteboard', 'Observation sheets'] },
    { title: 'Assessment workroom', text: 'Writing and trying out tests and rubrics.', art: officeHero(BED), tools: ['Item banks', 'Rubrics', 'Marking sheets'] },
    { title: 'Resource centre', text: 'Textbooks, lesson plans and teaching aids for school practice.', art: officeHero(SLUG), tools: ['Textbooks', 'Charts', 'Models'] },
    { title: 'Research room', text: 'A place to analyse classroom data and write up studies.', art: officeHero(BED), tools: ['Statistics software', 'Reference manager', 'Interview recorders'] },
  ],
  research: [
    { icon: 'book', title: 'Teaching and learning', text: 'How lessons, curricula and classrooms shape what students learn.', tags: ['Pedagogy', 'Curriculum', 'Classroom'] },
    { icon: 'chart', title: 'Assessment', text: 'Tests, grades and feedback in schools and colleges.', tags: ['Assessment', 'Feedback', 'Measurement'] },
    { icon: 'briefcase', title: 'Educational management', text: 'How schools are led, funded and improved.', tags: ['Leadership', 'Policy', 'Schools'] },
    { icon: 'users', title: 'Teacher education', text: 'How new teachers are prepared and supported.', tags: ['Training', 'Practice', 'Mentoring'] },
  ],
  careers: [
    { icon: 'cap', title: 'School teacher', text: 'Primary, middle and secondary schools.' },
    { icon: 'book', title: 'Teacher educator', text: 'Colleges and training institutes.' },
    { icon: 'briefcase', title: 'Educational manager', text: 'School and district education offices.' },
    { icon: 'flask', title: 'Researcher', text: 'Research organisations and postgraduate study.' },
    { icon: 'users', title: 'Trainer', text: 'Staff training for schools and organisations.' },
    { icon: 'globe', title: 'Education projects', text: 'Development and non-profit education programmes.' },
  ],
  studentLife: [
    { icon: 'users', title: 'Education society', text: 'Student-run talks and discussion circles on teaching.' },
    { icon: 'book', title: 'School practice', text: 'Teaching practice in partner schools during the programme.' },
    { icon: 'spark', title: 'Workshops', text: 'Short workshops on lesson planning and classroom management.' },
    { icon: 'trophy', title: 'Teaching showcase', text: 'A yearly day on which students present their best lessons.' },
  ],
  faq: [
    { q: 'Which degrees does the department list?', a: 'B.Ed (Hons), the Associate Degree in Education (2-year), the MPhil in Education and a PhD in Education.' },
    { q: 'What do I need for the B.Ed (Hons) or the Associate Degree?', a: ELIGIBILITY },
    { q: 'What do I need for the MPhil?', a: 'Sixteen years of education (MA Education, M.Ed or B.Ed Honours elementary or secondary, or equivalent, from an HEC-recognised university) with 45% marks in the annual system or a 2.5 CGPA in the semester system.' },
    { q: 'Who leads the department?', a: 'The page names Dr. Nasir Ahmad, Associate Professor, as Director.' },
    { q: 'How do I contact the department?', a: 'The page gives the mailbox cest@uswat.edu.pk.' },
  ],
  peopleTitle: 'Director and faculty',
  peopleLede: 'The six staff named on the department’s page, with the titles and qualifications it gives.',
  alumni: ['planning-a-lesson-for-mixed-ability-classes', 'why-students-miss-school-in-a-hill-district', 'peer-feedback-in-secondary-writing'],
  reference: {
    sources: [{ label: 'Department of Education and Staff Training page, University of Swat', url: PAGE }],
    verifiedAt: '2026-11-06',
    emails: ['cest@uswat.edu.pk'],
    openPoints: [
      'The page calls the unit both a department and a centre, and says the PhD is planned “from Spring 2025”; whether it has started is not stated.',
      'The page lists two MPhil eligibility rules under the same heading (sixteen years of education, then eighteen years); the second reads like the PhD rule. Both are in the university’s text and not reconciled here.',
      'The page links a scheme of studies for the B.Ed (4-year and 1.5-year) and for the MPhil and PhD from 2025; the courses are not reproduced here. The study plan on the programme page is illustrative.',
      'The page gives no phone number, fees, seat numbers or intake dates.',
      'Highlights, laboratories, research areas, careers and student life on this page are illustrative text for the template, not statements by the department.',
    ],
  },
  team: [
    { id: 'nasir-ahmad', name: 'Dr. Nasir Ahmad', title: 'Associate Professor', role: 'head', roleLabel: 'Director', qualifications: ['PhD in Education'] },
    { id: 'farooq-nawaz-khan', name: 'Dr. Farooq Nawaz Khan', title: 'Associate Professor', role: 'member', qualifications: ['PhD in Education'] },
    { id: 'sajjad-hussain', name: 'Dr. Sajjad Hussain', title: 'Associate Professor', role: 'member', qualifications: ['PhD in Education (Assessment)'] },
    { id: 'alam-zeb', name: 'Dr. Alam Zeb', title: 'Assistant Professor', role: 'member', qualifications: ['PhD in Education'] },
    { id: 'maryam-imad', name: 'Dr. Maryam Imad', title: 'Lecturer', role: 'member', qualifications: ['PhD in Education'] },
    { id: 'sadarat', name: 'Ms. Sadarat', title: 'Lecturer', role: 'member', qualifications: ['PhD Scholar'] },
  ],
}

export const bEdHons: DisciplineProfile = {
  slug: BED,
  department: SLUG,
  status: 'draft',
  name: 'B.Ed (Hons)',
  shortName: 'B.Ed (Hons)',
  badge: 'B.Ed (Hons)',
  level: 'B.Ed',
  eligibility: ELIGIBILITY,
  curriculumLede:
    'This study plan is illustrative: the department links its real schemes of studies for the 4-year and 1.5-year B.Ed on the university’s site. Elective courses are chosen from the tracks below.',
  tagline: 'Become a teacher who can lead a classroom and a school.',
  summary: 'Pre-service teacher education over four years: subject knowledge, teaching methods, assessment, practice teaching and a research project.',
  ...pictures(BED, SLUG, 'B.Ed (Hons). Department of Education and Staff Training, University of Swat.', 'Illustration for the B.Ed (Hons)'),
  about: [
    'The B.Ed (Hons) prepares future school teachers and teacher educators. The department has offered the B.Ed since 2010 and says its programmes aim to produce educational managers, teacher educators and researchers.',
    'Students study how children learn, how to plan and assess lessons, and how schools are managed, and practise in classrooms before they graduate.',
  ],
  whyStudy: [
    { icon: 'cap', title: 'Teach with confidence', text: 'Lesson planning, classroom management and assessment are taught and practised.' },
    { icon: 'users', title: 'Experienced teacher educators', text: 'Most named staff hold a PhD in education.' },
    { icon: 'search', title: 'Learn to research', text: 'A research project is part of the final year.' },
    { icon: 'briefcase', title: 'A clear career path', text: 'Schools, colleges, education offices and further study.' },
  ],
  outcomes: [
    'Plan, teach and assess lessons that suit the age and ability of their students.',
    'Manage a classroom in a way that is fair, orderly and kind.',
    'Explain educational policies and practices in Pakistan and compare them with other countries.',
    'Carry out a small classroom study and report it clearly.',
    'Use teaching aids and information technology in lessons.',
    'Act as positive agents of change in their schools and communities.',
  ],
  years: [
    year(1, ['Foundations of Education', 'Functional English', 'Islamic Studies', 'Child Development', 'Computer Skills'], ['Educational Psychology', 'Teaching of the Subject I', 'Expository Writing', 'Pakistan Studies', 'Introduction to Sociology']),
    year(2, ['Curriculum Development', 'Teaching Methods', 'Classroom Management', 'Subject Course I', 'Research Methods'], ['Educational Assessment', 'Teaching of the Subject II', 'Inclusive Education', 'Subject Course II', 'Educational Technology']),
    year(3, ['Educational Management', 'Statistics in Education', 'Guidance and Counselling', 'Subject Course III', 'Practice Teaching I'], ['Comparative Education', 'Teacher Education', 'Educational Policy', 'Subject Course IV', 'Practice Teaching II']),
    year(4, ['Elective I', 'Elective II', 'School Improvement', 'Research Project I'], ['Elective III', 'Teaching Practicum', 'Seminar', 'Research Project II']),
  ],
  tracks: [
    { icon: 'book', title: 'Teaching and curriculum', text: 'Methods, lesson design and curriculum.' },
    { icon: 'chart', title: 'Assessment', text: 'Tests, rubrics and feedback.' },
    { icon: 'briefcase', title: 'Educational management', text: 'Leading and improving schools.' },
    { icon: 'users', title: 'Inclusion and counselling', text: 'Supporting every learner.' },
  ],
  skills: [
    { group: 'Teaching', items: ['Lesson planning', 'Questioning', 'Classroom management', 'Assessment design'] },
    { group: 'Research', items: ['Survey design', 'Interviews', 'Basic statistics', 'Report writing'] },
    { group: 'Professional', items: ['Presenting', 'Teamwork', 'Educational technology', 'Reflective practice'] },
  ],
  careers: [
    { icon: 'cap', title: 'School teacher', text: 'Primary, middle and secondary schools.' },
    { icon: 'book', title: 'Teacher educator', text: 'Colleges and training institutes.' },
    { icon: 'briefcase', title: 'Educational manager', text: 'School and education-office roles.' },
    { icon: 'flask', title: 'Researcher', text: 'Research organisations and postgraduate study.' },
    { icon: 'users', title: 'Trainer', text: 'Staff training for schools and organisations.' },
  ],
  faq: [
    { q: 'What do I need to apply?', a: ELIGIBILITY },
    { q: 'How long is the programme?', a: 'The B.Ed (Hons) is planned over four years, in eight semesters. The page also links a 1.5-year B.Ed scheme. This plan is a draft; the department confirms the approved scheme of studies for each intake.' },
    { q: 'Is there teaching practice?', a: 'Yes. The plan includes practice teaching in schools and a final-year research project with a supervisor.' },
  ],
}
