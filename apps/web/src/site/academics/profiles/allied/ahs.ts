import { officeBanner, officeHero } from '../../../offices/art'
import type { DepartmentProfile } from '../../types'

import { FACULTY } from './core'

/* Faculty of Allied Health Sciences, laid out like the DCST department page (the owner's blueprint, 2026-11-24).
   FROM THE UNIVERSITY'S PAGES, read 2026-11-06 (kept in the register on the owner's Drive): the faculty page, the Quality Enhancement Cell
   page with its list of programmes (letter UoS/QEC/2025/X-8, 26 August 2025) and the tender category page. They give: the Senate approval, the
   four centres, the four programmes and which centre lists which, the vision and mission text, three named staff, one telephone number and one
   e-mail address, and a pre-bid meeting for laboratory equipment. Those facts are in `reference` below with their addresses.
   EVERYTHING ELSE (highlights, laboratories, research areas, careers, student life, questions, and the programmes' study plans) is illustrative
   text for the template that nobody at the faculty has checked: `status: 'draft'`. Replace it, then set `reviewed`. */

const FACULTY_PAGE = 'https://uswat.edu.pk/faculty/'
const QEC_PAGE = 'https://uswat.edu.pk/quality-enhancement-cell/'
const TENDER_PAGE = 'https://uswat.edu.pk/category/tender/page/3/'

export const alliedHealth: DepartmentProfile = {
  slug: FACULTY,
  path: '/faculties/allied-health-sciences',
  status: 'draft',
  fullName: 'Faculty of Allied Health Sciences',
  shortName: 'Allied Health Sciences',
  tagline: 'Laboratory, dental, rehabilitation and imaging sciences: degree programmes for the health workforce.',
  intro:
    'Degree programmes in medical laboratory technology, dental technology, physical therapy and radiography and imaging, taught in four centres.',
  hero: officeHero(FACULTY),
  banner: officeBanner(FACULTY, 'Faculty of Allied Health Sciences. University of Swat. Centres and programmes.'),
  tile: officeHero(FACULTY, 'Illustration for the Faculty of Allied Health Sciences'),
  levelText: 'BS and DPT',
  durationText: '4 to 5 years',
  durationNote: 'by programme',
  programmesLede:
    'Four degree programmes are listed on the faculty page. Where the university’s pages name the centre that runs a programme, it is shown on the card.',
  about: [
    'The establishment of the Faculty of Allied Health Sciences was approved at the 9th meeting of the Senate of the University of Swat. Four departments work under the faculty, and a range of degree programmes is offered.',
    'The study programmes aim to give graduates up-to-date knowledge and skills for handling patients and health-related emergency situations professionally, following national and international standards and ethical practice.',
    'The faculty page lists four centres: the Centre for Medical Technologies, the School of Nursing and Public Health, the Centre for Pharmaceutical and Rehabilitation Sciences and the Centre for Food and Nutrition Sciences.',
  ],
  vision:
    'The Faculty of Allied Health Sciences is determined to develop a skilled workforce to contribute to the national and knowledge economy of the country.',
  mission:
    'Study programmes in the faculty are designed to educate the students on the basic and advanced technologies related to Allied Health Sciences. The skilled graduates will contribute to the healthcare sector both nationally and internationally.',
  highlights: [
    { icon: 'layers', title: 'A strong science base', text: 'The first year covers anatomy, physiology and the basic sciences that each programme builds on.' },
    { icon: 'flask', title: 'Laboratory and clinical practice', text: 'Practical sessions run through every programme, and the last year includes hospital or laboratory attachments.' },
    { icon: 'users', title: 'Teamwork with clinicians', text: 'Students learn alongside the doctors, nurses and technologists they will work with.' },
    { icon: 'shield', title: 'Safety and ethics', text: 'Infection control, patient confidentiality and professional ethics are taught in every programme.' },
    { icon: 'rocket', title: 'A final-year project', text: 'Each student carries out a small research project with a supervisor and presents it to the faculty.' },
    { icon: 'cap', title: 'Paths to further study', text: 'The degrees prepare graduates for MS and PhD study in their field at home or abroad.' },
  ],
  disciplines: [
    'bs-medical-laboratory-technology',
    'bs-dental-technology',
    'doctor-of-physical-therapy',
    'bs-radiography-and-imaging-technology',
  ],
  labs: [
    {
      title: 'Clinical chemistry and haematology laboratory',
      text: 'Blood counts, chemistry panels and quality control on benches shared by small groups.',
      art: officeHero('bs-medical-laboratory-technology'),
      tools: ['Microscopes', 'Spectrophotometer', 'Haematology analyser'],
    },
    {
      title: 'Microbiology and serology laboratory',
      text: 'Culture, staining and antibody tests, with biosafety practice from the first session.',
      art: officeHero(FACULTY),
      tools: ['Incubators', 'Biosafety cabinet', 'Autoclave'],
    },
    {
      title: 'Dental prosthetics laboratory',
      text: 'Bench work in wax, acrylic, metal and ceramic, and a digital corner for scanning and design.',
      art: officeHero('bs-dental-technology'),
      tools: ['Articulators', 'Casting unit', 'CAD/CAM design software'],
    },
    {
      title: 'Rehabilitation and exercise therapy gym',
      text: 'Practice rooms for therapeutic exercise, manual therapy and electrotherapy.',
      art: officeHero('doctor-of-physical-therapy'),
      tools: ['Treatment couches', 'Electrotherapy units', 'Exercise equipment'],
    },
    {
      title: 'Radiography and imaging suite',
      text: 'Positioning practice on phantoms, and image processing and viewing workstations.',
      art: officeHero('bs-radiography-and-imaging-technology'),
      tools: ['Positioning phantoms', 'Image viewing workstations', 'Dose-measurement tools'],
    },
  ],
  research: [
    { icon: 'flask', title: 'Diagnostic laboratory methods', text: 'Making tests faster, cheaper and more reliable for hospitals and clinics.', tags: ['Clinical chemistry', 'Microbiology', 'Quality control'] },
    { icon: 'gear', title: 'Oral health and dental materials', text: 'Materials and methods for dentures and restorations that last in local conditions.', tags: ['Biomaterials', 'Prosthetics', 'Digital dentistry'] },
    { icon: 'users', title: 'Rehabilitation and community health', text: 'Therapy that reaches people with injury, stroke or disability in villages as well as cities.', tags: ['Musculoskeletal', 'Neurological', 'Community care'] },
    { icon: 'shield', title: 'Imaging quality and radiation safety', text: 'Lower doses and clearer images in the hospitals that serve the region.', tags: ['Dose reduction', 'Quality assurance', 'Ultrasound'] },
  ],
  careers: [
    { icon: 'flask', title: 'Laboratory technologist', text: 'Hospital, clinic and diagnostic laboratories.' },
    { icon: 'gear', title: 'Dental technologist', text: 'Dental laboratories and dental colleges.' },
    { icon: 'users', title: 'Physical therapist', text: 'Hospitals, rehabilitation centres and private clinics.' },
    { icon: 'search', title: 'Radiographer or imaging technologist', text: 'X-ray, CT, MRI and ultrasound departments.' },
    { icon: 'shield', title: 'Quality and safety officer', text: 'Keeping laboratories and imaging departments safe and accurate.' },
    { icon: 'cap', title: 'Researcher or lecturer', text: 'Further study, then teaching and research in allied health.' },
  ],
  studentLife: [
    { icon: 'users', title: 'Clinical skills society', text: 'Students practise procedures with senior students and instructors outside class hours.' },
    { icon: 'globe', title: 'Health awareness camps', text: 'Screening and awareness days in nearby communities, run with the faculty’s staff.' },
    { icon: 'book', title: 'Study groups', text: 'Peer groups for anatomy, physiology and the other first-year courses.' },
    { icon: 'spark', title: 'Seminars and guest talks', text: 'Doctors, pathologists and therapists visit to talk about their work.' },
  ],
  faq: [
    {
      q: 'Which programmes does the faculty offer?',
      a: 'BS Medical Laboratory Technology (MLT), BS Dental Technology, Doctor of Physical Therapy (DPT) and BS Radiography & Imaging Technology.',
    },
    {
      q: 'Which centre runs which programme?',
      a: 'The university’s pages list MLT and Dental Technology under the Centre for Medical Technologies, and DPT under the Centre for Pharmaceutical and Rehabilitation Sciences. They do not say which centre runs Radiography & Imaging.',
    },
    {
      q: 'How long are the programmes?',
      a: 'The study plans on the programme pages are four years for the BS degrees and five years for the DPT. These plans are drafts; the faculty confirms the approved scheme of studies for each intake.',
    },
    {
      q: 'What do I need to apply?',
      a: 'The eligibility for each programme is on its own page once the faculty has confirmed it. Applications are made through the university admissions portal when an intake is open.',
    },
    {
      q: 'Where can I find the latest notices?',
      a: 'Merit lists, timetables and announcements are published on the university notices page.',
    },
  ],
  peopleTitle: 'Leadership and faculty',
  peopleLede: 'The staff named on the faculty page. Dr. Ali Akbar is also listed as Director of the Centre for Medical Technologies and of the Centre for Pharmaceutical and Rehabilitation Sciences; the page does not name a dean.',
  alumni: ['clinical-chemistry-quality-audit', 'denture-acrylic-strength-comparison', 'back-pain-among-office-workers'],
  team: [
    { id: 'ali-akbar', name: 'Dr. Ali Akbar', title: 'Professor, Focal Person and Director of the faculty', role: 'head', roleLabel: 'Director of the faculty' },
    { id: 'nasib-zaman', name: 'Dr. Nasib Zaman', title: 'Associate Professor', role: 'member' },
    { id: 'zafar-ali', name: 'Dr. Zafar Ali', title: 'Assistant Professor', role: 'member' },
  ],
  reference: {
    sources: [
      { label: 'Faculty of Allied Health Sciences page, University of Swat', url: FACULTY_PAGE },
      {
        label: 'Quality Enhancement Cell page: list of programmes eligible for SAR 2024-2025 (letter UoS/QEC/2025/X-8, 26 August 2025)',
        url: QEC_PAGE,
      },
      { label: 'Tender page 3, University of Swat', url: TENDER_PAGE },
    ],
    verifiedAt: '2026-11-06',
    phones: [{ label: 'Office', number: '0946 920877' }],
    emails: ['cprs@uswat.edu.pk'],
    openPoints: [
      'The faculty page lists four centres and four programmes. The Quality Enhancement Cell letter of 26 August 2025 lists two centres (Medical Technologies, and Pharmaceutical and Rehabilitation Sciences, which it once calls Pharmaceutical Sciences) and three programmes, and says the faculty launched admission with Fall 2025. Both are as written.',
      'No page says which centre runs BS Radiography & Imaging Technology, or what the School of Nursing and Public Health and the Centre for Food and Nutrition Sciences offer.',
      'The faculty page gives one Vision / Mission text; it is split into the two cards above.',
      'The telephone number and the e-mail address are given with the focal person’s entry; the page does not say whether they belong to the faculty office or to the Centre for Pharmaceutical and Rehabilitation Sciences.',
      'The tender page lists the minutes of a pre-bid meeting for the purchase of laboratory equipment, glassware and chemicals for Allied Health Sciences (2025, no date given). The laboratories named above are illustrative.',
      'Curriculum, duration, eligibility, fees, number of seats and intake dates are not published on any of these pages. The study plans and durations shown are illustrative.',
    ],
  },
}
