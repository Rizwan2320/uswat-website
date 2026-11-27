import type { DisciplineProfile } from '../../types'
import { year } from '../core'

import { FACULTY, ahFaq, pictures } from './core'

/* BS Medical Laboratory Technology (MLT). The programme name, its place under the Centre for Medical Technologies and its listing are from the
   university's own pages (see ahs.ts). The text below is illustrative until the faculty reviews it: `status: 'draft'`. */
export const mlt: DisciplineProfile = {
  slug: 'bs-medical-laboratory-technology',
  department: FACULTY,
  status: 'draft',
  name: 'BS Medical Laboratory Technology (MLT)',
  centre: 'Centre for Medical Technologies',
  shortName: 'MLT',
  tagline: 'Test, measure and diagnose: the laboratory science behind patient care.',
  summary: 'Blood, chemistry, microbiology and tissue testing: the laboratory work that doctors depend on for a diagnosis.',
  ...pictures(
    'bs-medical-laboratory-technology',
    'BS Medical Laboratory Technology (MLT). Faculty of Allied Health Sciences, University of Swat.',
    'Illustration for BS Medical Laboratory Technology',
  ),
  about: [
    'BS Medical Laboratory Technology prepares students to run the tests that support diagnosis and treatment. They learn to collect and handle samples, to perform tests in clinical chemistry, haematology, microbiology and histopathology, and to check that every result is reliable.',
    'Most of the work is practical. Students spend regular hours in the laboratory from the first year, and the last year includes attachments in hospital laboratories. Electives let them lean toward a field such as molecular diagnostics or infection control.',
  ],
  whyStudy: [
    { icon: 'flask', title: 'Hands-on from year one', text: 'Laboratory sessions begin in the first semester, with safety and sample handling before any test.' },
    { icon: 'search', title: 'Results people rely on', text: 'Quality control and accuracy are taught as part of every test, not as an extra.' },
    { icon: 'users', title: 'Part of the care team', text: 'Laboratory technologists work with doctors, nurses and pathologists every day.' },
    { icon: 'cap', title: 'A route to further study', text: 'The degree prepares graduates for MS study in laboratory sciences and public health.' },
  ],
  outcomes: [
    'Collect, label, store and transport samples safely, following infection-control rules.',
    'Perform and interpret routine tests in clinical chemistry, haematology, microbiology and serology.',
    'Prepare and stain tissue and blood films, and recognise common abnormal findings.',
    'Run quality-control checks, keep laboratory records and report results accurately.',
    'Work as part of a hospital or diagnostic team, and follow the ethics of patient confidentiality.',
  ],
  years: [
    year(1, ['Anatomy and Physiology I', 'General Chemistry', 'Introduction to Medical Laboratory Technology', 'Functional English', 'Islamic Studies'], ['Anatomy and Physiology II', 'Biochemistry I', 'Cell Biology', 'Expository Writing', 'Pakistan Studies']),
    year(2, ['Biochemistry II', 'Haematology I', 'Microbiology I', 'Medical Statistics', 'Computer Skills for Health Sciences'], ['Haematology II', 'Microbiology II', 'Clinical Chemistry I', 'Immunology', 'Laboratory Safety and Quality']),
    year(3, ['Clinical Chemistry II', 'Histopathology and Cytology', 'Parasitology', 'Blood Banking and Transfusion', 'Molecular Diagnostics'], ['Clinical Microbiology', 'Serology and Virology', 'Research Methods', 'Laboratory Management', 'Elective I']),
    year(4, ['Laboratory Attachment I', 'Advanced Diagnostics', 'Elective II', 'Research Project I'], ['Laboratory Attachment II', 'Medical Ethics and Professionalism', 'Elective III', 'Research Project II']),
  ],
  tracks: [
    { icon: 'flask', title: 'Clinical chemistry and haematology', text: 'Automated analysers, blood counts and the chemistry of disease.' },
    { icon: 'shield', title: 'Microbiology and infection control', text: 'Culture, identification and sensitivity testing, and how hospitals prevent infection.' },
    { icon: 'search', title: 'Histopathology and cytology', text: 'Preparing and staining tissue so a pathologist can read it.' },
    { icon: 'database', title: 'Molecular diagnostics', text: 'DNA and RNA based tests and how their results are interpreted.' },
  ],
  skills: [
    { group: 'Laboratory', items: ['Sample handling', 'Microscopy', 'Staining', 'Culture techniques'] },
    { group: 'Analysis', items: ['Quality control', 'Result interpretation', 'Medical statistics'] },
    { group: 'Professional', items: ['Record keeping', 'Biosafety', 'Teamwork', 'Ethics'] },
  ],
  careers: [
    { icon: 'flask', title: 'Medical laboratory technologist', text: 'Hospital, clinic and private diagnostic laboratories.' },
    { icon: 'shield', title: 'Infection control officer', text: 'Monitoring and reducing infections in hospitals.' },
    { icon: 'search', title: 'Quality and safety officer', text: 'Keeping a laboratory accurate and compliant.' },
    { icon: 'briefcase', title: 'Public health laboratory worker', text: 'Disease surveillance and screening programmes.' },
    { icon: 'cap', title: 'Researcher or lecturer', text: 'MS and PhD study, then teaching and research.' },
  ],
  faq: ahFaq('BS MLT', 4),
}
